<template>
	<view class="container">
		<view class="wheel-wrapper">
			<view class="wheel-container">
				<!-- 转盘容器：负责 CSS 旋转动画 -->
				<view class="wheel-rotator" :style="rotatorStyle" @transitionend="onTransitionEnd">
					<!-- Canvas 绘制静态转盘内容 -->
					<canvas canvas-id="wheelCanvas" :style="{ width: size + 'px', height: size + 'px' }" :width="size"
						:height="size"></canvas>
				</view>
				<!-- 固定指针 -->
				<view class="pointer"></view>
			</view>
		</view>

		<view class="info">
			<text class="result" v-if="result">{{ result }}</text>
			<text class="hint" v-else>点击下方按钮转转盘</text>
		</view>

		<button type="primary" @click="startSpin" :disabled="animActive" class="spin-btn">
			{{ animActive ? '旋转中...' : '开始转' }}
		</button>

		<!-- 颜色图例（可选） -->
		<view class="legend">
			<view class="legend-item" v-for="(item, idx) in options" :key="idx">
				<view class="color-block" :style="{ backgroundColor: item.color }"></view>
				<text>{{ item.emoji }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				size: 300, // 画布尺寸（宽高）
				radius: 120, // 转盘半径
				center: 150, // 圆心坐标（size/2）
				options: [{
						emoji: '🍔',
						color: '#FFB6C1',
						label: '1'
					},
					{
						emoji: '🍜',
						color: '#FFD700',
						label: '2'
					},
					{
						emoji: '🍣',
						color: '#87CEEB',
						label: '3'
					},
					{
						emoji: '🥩',
						color: '#D2B48C',
						label: '4'
					},
					{
						emoji: '🍕',
						color: '#FFA07A',
						label: '5'
					},
					{
						emoji: '🥗',
						color: '#98FB98',
						label: '6'
					}
				],
				currentRotation: 0, // 当前旋转角度（度）
				targetRotation: 0, // 目标旋转角度
				animActive: false, // 动画是否进行中
				currentItem: 0,
				firstAnimation: true,
				result: '',
				ctx: null,
				// 用于控制 CSS 过渡的属性
				transitionDuration: '0s', // 动画时长，默认0s表示无过渡
				transitionTiming: 'ease-out',
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
					width: this.size + 'px',
					height: this.size + 'px',
				};
			}
		},
		onReady() {
			// 初始化 Canvas 绘制
			this.ctx = uni.createCanvasContext('wheelCanvas', this);
			this.drawWheel();
		},
		methods: {
			// 绘制转盘（仅执行一次）
			drawWheel() {
				const ctx = this.ctx;
				if (!ctx) return;

				ctx.clearRect(0, 0, this.size, this.size);
				const step = (this.angleStep * Math.PI) / 180; // 转为弧度

				this.options.forEach((item, index) => {
					const start = index * step - Math.PI / 2;
					const end = (index + 1) * step - Math.PI / 2;

					// 绘制扇形
					ctx.beginPath();
					ctx.moveTo(this.center, this.center);
					ctx.arc(this.center, this.center, this.radius, start, end);
					ctx.closePath();
					ctx.fillStyle = item.color;
					ctx.fill();

					// 在扇形中央绘制 emoji
					const midAngle = start + step / 2;
					const textRadius = this.radius * 0.7; // 文字距圆心的距离
					const x = this.center + Math.cos(midAngle) * textRadius;
					const y = this.center + Math.sin(midAngle) * textRadius;
					
					ctx.font = 'bold 32px "PingFang SC", "Helvetica Neue", "Segoe UI Emoji", sans-serif';
					ctx.fillStyle = '#2c3e50';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(item.label, x, y);
				});

				// 绘制中心小圆（覆盖指针起始点）
				ctx.beginPath();
				ctx.arc(this.center, this.center, 20, 0, 2 * Math.PI);
				ctx.fillStyle = '#f5f5f5';
				ctx.fill();
				ctx.strokeStyle = '#cccccc';
				ctx.lineWidth = 2;
				ctx.stroke();

				ctx.draw();
			},

			// 开始旋转
			startSpin() {
				if (this.animActive) return;

				// 随机选择最终结果索引
				const targetIndex = Math.floor(Math.random() * this.options.length);
				// step代表旋转一个选项所需要的弧度
				const step = this.angleStep;
				// 增加多圈旋转（5-10圈）
				const spins = 5 + Math.floor(Math.random() * 6);
				let target = 0;

				if (this.firstAnimation) {
					// 计算目标旋转角度：
					// 指针固定向上（0°），我们希望目标扇区的中间对准指针
					// 扇区中间角度 = targetIndex * angleStep + angleStep/2
					// 需要转到的角度 = -中间角度 + 360 * 圈数
					const targetMid = targetIndex * step + step / 2;
					target = -targetMid + spins * 360;
					this.currentItem = targetIndex;
					this.firstAnimation = false;
				} else {
					if (this.currentItem > targetIndex) {
						//        当前角度                       当前选项和目标选项差值                额外旋转的圈
						target = this.currentRotation + (this.currentItem - targetIndex) * step + spins * 360
					} else {
						target = this.currentRotation + (6 - (targetIndex - this.currentItem)) * step + spins * 360
					}
					this.currentItem = targetIndex;
				}
				
				// 即将旋转到的目标弧度
				this.targetRotation = target;
				this.animActive = true;

				// 开启过渡动画
				this.transitionDuration = '3s'; // 动画时长3秒

				// 更新当前旋转角度，触发 CSS 过渡
				this.currentRotation = this.targetRotation;
			},

			// 动画结束处理
			onTransitionEnd() {
				if (!this.animActive) return; // 防止多次触发
				this.animActive = false;
				this.calculateResult();
			},

			// 计算并显示结果
			calculateResult() {
				const selected = this.options[this.currentItem];
				this.result = `随机结果为：${selected.emoji}`;

				uni.showToast({
					title: this.result,
					icon: 'none',
					duration: 2000
				});
			}
		},
		beforeDestroy() {
			// 清理 Canvas 上下文（可选）
			this.ctx = null;
		}
	};
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(145deg, #f7f9fc 0%, #eef2f7 100%);
		padding: 20px 0;
		box-sizing: border-box;
	}

	.wheel-wrapper {
		background: #ffffff;
		border-radius: 50%;
		padding: 15px;
		box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1);
		margin-bottom: 30px;
	}

	.wheel-container {
		position: relative;
		width: 300px;
		height: 300px;
	}

	.wheel-rotator {
		position: absolute;
		top: 0;
		left: 0;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		overflow: hidden;
		/* 确保 Canvas 绘制内容不超出圆形区域 */
		box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
		transition-property: transform;
		transition-duration: 0s;
		/* 默认无过渡，由 JS 动态控制 */
		transition-timing-function: ease-out;
		/* 保持硬件加速 */
		will-change: transform;
	}

	/* 固定指针 */
	.pointer {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -100%);
		width: 0;
		height: 0;
		border-left: 20px solid transparent;
		border-right: 20px solid transparent;
		border-bottom: 35px solid #e74c3c;
		z-index: 20;
		filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
	}

	.pointer::after {
		content: '';
		position: absolute;
		top: 30px;
		left: -8px;
		width: 16px;
		height: 16px;
		background: #f1c40f;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.info {
		min-height: 50px;
		margin: 10px 0 20px;
		text-align: center;
	}

	.result {
		font-size: 24px;
		font-weight: bold;
		color: #2c3e50;
		background: rgba(255, 255, 255, 0.8);
		padding: 10px 25px;
		border-radius: 50px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
		display: inline-block;
	}

	.hint {
		font-size: 18px;
		color: #7f8c8d;
		font-style: italic;
	}

	.spin-btn {
		width: 220px;
		height: 50px;
		line-height: 50px;
		background: #3498db;
		color: white;
		font-size: 20px;
		font-weight: bold;
		border-radius: 30px;
		box-shadow: 0 8px 16px rgba(52, 152, 219, 0.4);
		border: none;
		margin-bottom: 30px;
	}

	.spin-btn[disabled] {
		background: #bdc3c7;
		box-shadow: none;
		opacity: 0.6;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 15px;
		padding: 15px 20px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 40px;
		backdrop-filter: blur(5px);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 18px;
		color: #2c3e50;
	}

	.color-block {
		width: 24px;
		height: 24px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>