"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      size: 300,
      // 画布尺寸（宽高）
      radius: 120,
      // 转盘半径
      center: 150,
      // 圆心坐标（size/2）
      options: [
        {
          emoji: "🍔",
          color: "#FFB6C1",
          label: "1"
        },
        {
          emoji: "🍜",
          color: "#FFD700",
          label: "2"
        },
        {
          emoji: "🍣",
          color: "#87CEEB",
          label: "3"
        },
        {
          emoji: "🥩",
          color: "#D2B48C",
          label: "4"
        },
        {
          emoji: "🍕",
          color: "#FFA07A",
          label: "5"
        },
        {
          emoji: "🥗",
          color: "#98FB98",
          label: "6"
        }
      ],
      currentRotation: 0,
      // 当前旋转角度（度）
      targetRotation: 0,
      // 目标旋转角度
      animActive: false,
      // 动画是否进行中
      currentItem: 0,
      firstAnimation: true,
      result: "",
      ctx: null,
      // 用于控制 CSS 过渡的属性
      transitionDuration: "0s",
      // 动画时长，默认0s表示无过渡
      transitionTiming: "ease-out"
    };
  },
  computed: {
    // 每个扇形的角度（度）
    angleStep() {
      return 360 / this.options.length;
    },
    // 旋转容器的样式（绑定 transform 和 transition）
    rotatorStyle() {
      return {
        transform: `rotate(${this.currentRotation}deg)`,
        transition: `transform ${this.transitionDuration} ${this.transitionTiming}`,
        width: this.size + "px",
        height: this.size + "px"
      };
    }
  },
  onReady() {
    this.ctx = common_vendor.index.createCanvasContext("wheelCanvas", this);
    this.drawWheel();
  },
  methods: {
    // 绘制转盘（仅执行一次）
    drawWheel() {
      const ctx = this.ctx;
      if (!ctx)
        return;
      ctx.clearRect(0, 0, this.size, this.size);
      const step = this.angleStep * Math.PI / 180;
      this.options.forEach((item, index) => {
        const start = index * step - Math.PI / 2;
        const end = (index + 1) * step - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(this.center, this.center);
        ctx.arc(this.center, this.center, this.radius, start, end);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        const midAngle = start + step / 2;
        const textRadius = this.radius * 0.7;
        const x = this.center + Math.cos(midAngle) * textRadius;
        const y = this.center + Math.sin(midAngle) * textRadius;
        ctx.font = 'bold 32px "PingFang SC", "Helvetica Neue", "Segoe UI Emoji", sans-serif';
        ctx.fillStyle = "#2c3e50";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label, x, y);
      });
      ctx.beginPath();
      ctx.arc(this.center, this.center, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#f5f5f5";
      ctx.fill();
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.draw();
    },
    // 开始旋转
    startSpin() {
      if (this.animActive)
        return;
      const targetIndex = Math.floor(Math.random() * this.options.length);
      const step = this.angleStep;
      const spins = 5 + Math.floor(Math.random() * 6);
      let target = 0;
      if (this.firstAnimation) {
        const targetMid = targetIndex * step + step / 2;
        target = -targetMid + spins * 360;
        this.currentItem = targetIndex;
        this.firstAnimation = false;
      } else {
        if (this.currentItem > targetIndex) {
          target = this.currentRotation + (this.currentItem - targetIndex) * step + spins * 360;
        } else {
          target = this.currentRotation + (6 - (targetIndex - this.currentItem)) * step + spins * 360;
        }
        this.currentItem = targetIndex;
      }
      this.targetRotation = target;
      this.animActive = true;
      this.transitionDuration = "3s";
      this.currentRotation = this.targetRotation;
    },
    // 动画结束处理
    onTransitionEnd() {
      if (!this.animActive)
        return;
      this.animActive = false;
      this.calculateResult();
    },
    // 计算并显示结果
    calculateResult() {
      const selected = this.options[this.currentItem];
      this.result = `随机结果为：${selected.emoji}`;
      common_vendor.index.showToast({
        title: this.result,
        icon: "none",
        duration: 2e3
      });
    }
  },
  beforeDestroy() {
    this.ctx = null;
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.size + "px",
    b: $data.size + "px",
    c: $data.size,
    d: $data.size,
    e: common_vendor.s($options.rotatorStyle),
    f: common_vendor.o((...args) => $options.onTransitionEnd && $options.onTransitionEnd(...args)),
    g: $data.result
  }, $data.result ? {
    h: common_vendor.t($data.result)
  } : {}, {
    i: common_vendor.t($data.animActive ? "旋转中..." : "开始转"),
    j: common_vendor.o((...args) => $options.startSpin && $options.startSpin(...args)),
    k: $data.animActive,
    l: common_vendor.f($data.options, (item, idx, i0) => {
      return {
        a: item.color,
        b: common_vendor.t(item.emoji),
        c: idx
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
