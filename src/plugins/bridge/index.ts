import { Handler as HandleEnum,Message } from '@/app/NoteBridge';
import { Vue as _Vue } from 'vue/types/vue'

declare global {

  interface WindowWebkitRequestMessageHandler {
    postMessage: <ParamType>(message: NativeMessage<ParamType>) => void
  }

  interface WindowWebkitResponseMessageHandler {
    postMessage: <ResponseType>(message: NativeResponse<ResponseType>) => void
  }

  interface WindowWebkitMessageHandlers {
    request?: WindowWebkitRequestMessageHandler;
    response?: WindowWebkitResponseMessageHandler;
  }

  interface WindowWebkit {
    messageHandlers?: WindowWebkitMessageHandlers
  }

  interface Window {
    bridge: Bridge;
    webkit?: WindowWebkit;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
      $bridge: Bridge;
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    bridge?: Bridge;
  }
}

interface NativeMessage<ParamType> {
  name:  keyof typeof HandleEnum | keyof typeof Message; //@see Handle
  id: number;
  param: ParamType;
}

interface NativeResponse<ResponseType> {
  id?: number;
  code: number;
  data?: ResponseType
  message?: string
}

interface Executor {
  resolve: any
  reject: any
}

interface Handler<ParamType, ResponseType> {
  (message: NativeMessage<ParamType>): Promise<NativeResponse<ResponseType>>;
}

interface VoidHandler<ParamType> {
  (message: NativeMessage<ParamType>): Promise<void>;
}

export default class Bridge {

  private executors = new Map<number, Executor>()
  private currentId = 0

  private handlers = new Map<string, Handler<any, any>>()

  constructor() {
    window.bridge = this
  }

  static install = (Vue: typeof _Vue) => {

    let _bridge: Bridge | undefined
    Vue.mixin({
      beforeCreate(): void {
        if (this.$options.bridge) {
          _bridge = this.$options.bridge
          if (_bridge) {
            // _bridge.mainApp = this
          }
        }
      }
    })

    Object.defineProperty(Vue.prototype, '$bridge', {
      get() {
        return _bridge
      }
    })
  }

  registerHandler<ParamType, ResponseType>(name: string, handler: Handler<ParamType, ResponseType>) {
    this.handlers.set(name, handler)
  }

  registerVoidHandler<ParamType>(name: string, handler: VoidHandler<ParamType>) {
    this.handlers.set(name, async (request) => {
      handler(request)
      return {
        code: 0
      }
    })
  }

  createNativeMessage<ParamType>(name: keyof typeof HandleEnum | keyof typeof Message, param: ParamType): NativeMessage<ParamType> {
    const id = this.currentId++
    return {
      id, name, param
    }
  }

  postRequestMessage<ParamType>(message: NativeMessage<ParamType>) {
    //ios
    window.webkit?.messageHandlers?.request?.postMessage(message)

    //android 
    // @ts-ignore
    window.request?.postMessage(JSON.stringify(message))
  }

  postResponseMessage<ParamType>(response: NativeResponse<ParamType>) {
    //ios
    window.webkit?.messageHandlers?.response?.postMessage(response)

    //android 
    // @ts-ignore
    window.response?.postMessage(JSON.stringify(response))
  }

  onResponse(responseString: string) {
    const response = JSON.parse(responseString) as NativeResponse<any>
    if (response.id == null) {
      return
    }
    const executor = this.executors.get(response.id)
    if (executor == null) {
      return
    }
    this.executors.delete(response.id)
    if (response.code == 0) {
      executor.resolve(response.data)
    } else {
      executor.reject(response)
    }
  }

  onRequest(requestString: string) {
    const request = JSON.parse(requestString) as NativeMessage<any>
    const handler = this.handlers.get(request.name)
    if (handler == null) {
      return
    }

    handler(request).then(
      (res) => {
        res.id = request.id
        this.postResponseMessage(res)
      }
    ).catch(
      (err) => {
        this.postResponseMessage({
          id: request.id,
          code: err.code ?? -1,
          data: err.data ?? undefined,
          message: err.message ?? `${err}`
        })
      }
    )
  }

  async sendMessage<ParamType, ResponseType>(message: keyof typeof HandleEnum | keyof typeof Message, param: ParamType): Promise<ResponseType> {
    const nativeMessage = this.createNativeMessage(message, param)
    return new Promise<ResponseType>((resolve, reject) => {
      this.executors.set(nativeMessage.id, { resolve, reject })
      this.postRequestMessage(nativeMessage)
    })
  }

  sendEmptyMessage<ResponseType>(message: keyof typeof HandleEnum | keyof typeof Message ) {
    const nativeMessage = this.createNativeMessage(message, {})
    this.postRequestMessage(nativeMessage)
  }

}