import Vue from "vue";
import Bridge from "@/plugins/bridge";

export enum Message {
    OnLoad = "OnLoad",
    OnUpdate = "OnUpdate",
    OnTransaction = "OnTransaction",
    GetInitContent = "GetInitContent",
};

export enum Handler {
    SetUpdateTime = "SetUpdateTime",
    ToggleBold = "ToggleBold",
    ToggleBulletList = "ToggleBulletList",
    ToggleOrderedList = "ToggleOrderedList",
    SetFontSize = "SetFontSize",
    SetColor = "SetColor",
    InsertImage = "InsertImage",
    SetContent = "SetContent",
    SetInitContent = "SetInitContent",
    Focus = "Focus",
    Blur = "Blur",
    GetJson = "GetJson",
    GetHtml = "GetHtml",
};

export interface SetUpdateTimeData {
    updateTime: string
}

export interface OnUpdateData {
    json: string
}

export interface OnTransactionData {
    isBold: boolean
    isBulletList: boolean
    isOrderedList: boolean
}

export interface GetInitContentData {
    content: any
}

export interface SetFontSizeData {
    fontSize: number
}

export interface SetColorData {
    color: string
}

export interface InsertImageData {
    src: string
    thumbnail: string
}

export interface SetContentData {
    content: any
}

export interface GetContentData {
    content: string
}

let bridge = new Bridge();
Vue.use(Bridge);

export default bridge;