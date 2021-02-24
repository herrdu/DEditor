import Vue from "vue";
import App from "./app";
import bridge from "./NoteBridge";

Vue.config.productionTip = false;
new Vue({
  bridge,
  render: h => h(App)
}).$mount("#app");
