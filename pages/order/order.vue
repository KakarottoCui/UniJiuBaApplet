<template>
	<view class="content">
		<view class="navbar">
			<view 
				v-for="(item, index) in navList" :key="index" 
				class="nav-item" 
				:class="{current: tabCurrentIndex === index}"
				@click="tabClick(index)"
			>
				{{item.text}}
			</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem,tabIndex) in navList" :key="tabIndex">
				<scroll-view 
					class="list-scroll-content" 
					scroll-y
					@scrolltolower="loadData"
				>
					<!-- 空白页 -->
					<empty v-if=" tabItem.orderList.length === 0"></empty>
					
					<!-- 订单列表 -->
					<view 
						v-for="(item,index) in tabItem.orderList" :key="index"
						class="order-item" @click="toOrderInfo(item)"
					>
						<view class="i-top b-b">
							<text class="time">订单ID：{{item.id}}</text>
							<text class="state" :class="'text-'+item.state">{{getStateName(item.state)}}</text>
							
						</view>
						
						<scroll-view v-if="item.nmOrderItemList.length > 1" class="goods-box" scroll-x>
							<view
								v-for="(goodsItem, goodsIndex) in item.nmOrderItemList" :key="goodsIndex"
								class="goods-item"
							>
								<image class="goods-img" :src="filePath+ goodsItem.nmGoods.pic" mode="aspectFill"></image>
							</view>
						</scroll-view>
						<view 
							v-if="item.nmOrderItemList.length === 1" 
							class="goods-box-single"
							v-for="(goodsItem, goodsIndex) in item.nmOrderItemList" :key="goodsIndex"
						>
							<image class="goods-img" :src="filePath+ goodsItem.nmGoods.pic" mode="aspectFill"></image>
							<view class="right">
								<text class="title clamp">{{goodsItem.nmGoods.title}}</text>
								<text class="price">{{goodsItem.nmGoods.price}}</text>
							</view>
						</view>
						
						<view class="price-box">
							<view>{{item.createTime}}
								
							</view>
							<view>
								共
								<text class="num">{{item.nmOrderItemList.length}}</text>
								件商品 实付款
								<text class="price">{{item.priceSum}}</text>
							</view>
							
						</view>
						<view class="action-box b-t" v-if="item.state < 2">
							<button v-if="item.state == 1" class="action-btn" style="color: indianred;" @click="finishedOrder(item)">完成订单</button>
							<button class="action-btn" @click="cancelOrder(item)">取消订单</button>
							<button v-if="item.state == 0" @click="payOrder(item)" class="action-btn recom">立即支付</button>
						</view>
					</view>
					 
					
					
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template> 

<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import empty from "@/components/empty";
	import Json from '@/Json';
	import appRequest from "../../common/appRequestUrl.js";
	export default {
		components: {
			uniLoadMore,
			empty
		},
		data() {
			return {
				filePath:appRequest.urlMap.getFile,
				userInfo:{},
				tabCurrentIndex: 0,
				navList: [{
						state: 0,
						text: '全部',
						loadingType: 'more',
						orderList: [],
						info:null,
						loaded:true
						
					},
					{
						state: 1,
						text: '待付款',
						loadingType: 'more',
						orderList: [],
						info:0,
						loaded:true
					},
					{
						state: 2,
						text: '已完成',
						loadingType: 'more',
						orderList: [],
						info:2,
						loaded:true
					},
					{
						state: 3,
						text: '已取消',
						loadingType: 'more',
						orderList: [],
						info:3,
						loaded:true
					}
				],
			};
		},
		
		onLoad(options){
			/**
			 * 修复app端点击除全部订单外的按钮进入时不加载数据的问题
			 * 替换onLoad下代码即可
			 */
			switch (options.state){
				case -1:
					his.tabCurrentIndex = 0
					break;
				case 0:
					his.tabCurrentIndex = 1
					break;	
				case 2:
					his.tabCurrentIndex = 2
					break;
				case 3:
					his.tabCurrentIndex = 3
					break;	
				default:
					break;
			}
			
			let user = appRequest.getUserInfo();
			this.userInfo = user;
			this.loadData()
			
		},
		 onShow:function(){
		 	let user = appRequest.getUserInfo();
		 	this.userInfo = user;
		 	
		 	if(!user){
		 		uni.clearStorage()
		 		this.userInfo=false;
		 		uni.switchTab({
		 			url:"/pages/index/index"
		 		})
		 	}
		 },
		methods: {
			toOrderInfo(item){
				uni.navigateTo({
					url: '/pages/order/orderInfo?id='+item.id
				})
			},
			payOrder(item){
				uni.redirectTo({
					url: '/pages/money/pay?id='+ item.id+"&price="+item.priceSum
				})
			},
			getStateName(state){
				switch (state){
					case 0:
						return "未支付";
						break;
					case 1:
						return "已支付";
						break;
					case 2:
						return "已完成";
						break;
					case 3:
						return "已取消";
						break;			
					default:
						break;
				}
			},
			//获取订单列表
			loadData(source){
				//这里是将订单挂载到tab列表下
				let index = this.tabCurrentIndex;
				let navItem = this.navList[index];
				let state = navItem.state;
				
				// if(source === 'tabChange' && navItem.loaded === true){
				// 	//tab切换只有第一次需要加载数据
				// 	return;
				// }
				// if(navItem.loadingType === 'loading'){
				// 	//防止重复加载
				// 	return;
				// }
				
				// navItem.loadingType = 'loading';
				
				let _this = this;
				appRequest.request({
				  data: {
					  state:navItem.info,
					  validFlag:1,
					  creater:this.userInfo.uid
				  },
				  url: appRequest.urlMap.findNmOrderList,
				  success: function(res) {
				    if (res.data.code == 200) {
				      navItem.orderList = res.data.data;
					  console.log(navItem.orderList.length)
				    } else {
				      appRequest.msg(res.data.msg);
				    }
				  },
				  fail: function(res) {
				   appRequest.msg("网络异常");
				  }
				});
				
				// setTimeout(()=>{
				// 	let orderList = Json.orderList.filter(item=>{
				// 		//添加不同状态下订单的表现形式
				// 		item = Object.assign(item, this.orderStateExp(item.state));
				// 		//演示数据所以自己进行状态筛选
				// 		if(state === 0){
				// 			//0为全部订单
				// 			return item;
				// 		}
				// 		return item.state === state
				// 	});
				// 	orderList.forEach(item=>{
				// 		navItem.orderList.push(item);
				// 	})
				// 	//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
				// 	this.$set(navItem, 'loaded', true);
					
				// 	//判断是否还有数据， 有改为 more， 没有改为noMore 
				// 	navItem.loadingType = 'more';
				// }, 600);	
			}, 

			//swiper 切换
			changeTab(e){
				this.tabCurrentIndex = e.target.current;
				this.loadData('tabChange');
			},
			//顶部tab点击
			tabClick(index){
				this.tabCurrentIndex = index;
			},
			//删除订单
			deleteOrder(index){
				uni.showLoading({
					title: '请稍后'
				})
				setTimeout(()=>{
					this.navList[this.tabCurrentIndex].orderList.splice(index, 1);
					uni.hideLoading();
				}, 600)
			},
			finishedOrder(item){
				let _this = this;
				appRequest.request({
				  data: {
					  id:item.id,
					  state:2,
					  compTime:_this.dateFormat('YYYY-mm-dd HH:MM:SS',new Date())
				  },
				  url: appRequest.urlMap.editNmOrder,
				  success: function(res) {
				    if (res.data.code == 200) {
				      appRequest.msg("已完成");
					  _this.loadData();
				    } else {
				      appRequest.msg(res.data.msg);
				    }
				  },
				  fail: function(res) {
				   appRequest.msg("网络异常");
				  }
				});
			},
			//取消订单
			cancelOrder(item){
				
				let _this = this;
				
				uni.showModal({
					title:"提醒",
					content:"是否取消？取消订单商品将归还购物车。",
					success:function(res){
						if(res.confirm){
							appRequest.request({
							  data: {
								  id:item.id,
								  state:3,
								  compTime:_this.dateFormat('YYYY-mm-dd HH:MM:SS',new Date())
							  },
							  url: appRequest.urlMap.cancleNmOrder,
							  success: function(res) {
							    if (res.data.code == 200) {
							      appRequest.msg("已取消");
								  _this.loadData();
							    } else {
							      appRequest.msg(res.data.msg);
							    }
							  },
							  fail: function(res) {
							   appRequest.msg("网络异常");
							  }
							});
						}
					}
				})
			},
			dateFormat : function(fmt, date) {
				let ret;
				const opt = {
					"Y+": date.getFullYear().toString(), // 年
					"m+": (date.getMonth() + 1).toString(), // 月
					"d+": date.getDate().toString(), // 日
					"H+": date.getHours().toString(), // 时
					"M+": date.getMinutes().toString(), // 分
					"S+": date.getSeconds().toString() // 秒
					// 有其他格式化字符需求可以继续添加，必须转化成字符串
				};
				for (let k in opt) {
					ret = new RegExp("(" + k + ")").exec(fmt);
					if (ret) {
						fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
					};
				};
				return fmt;
			},
			//订单状态文字和颜色
			orderStateExp(state){
				let stateTip = '',
					stateTipColor = '#fa436a';
				switch(+state){
					case 0:
						stateTip = '待付款'; break;
					case 1:
						stateTip = '已支付'; break;
					case 9:
						stateTip = '订单已关闭'; 
						stateTipColor = '#909399';
						break;
						
					//更多自定义
				}
				return {stateTip, stateTipColor};
			}
		},
	}
</script>

<style lang="scss">
	page, .content{
		background: $page-color-base;
		height: 100%;
	}
	
	.swiper-box{
		height: calc(100% - 40px);
	}
	.list-scroll-content{
		height: 100%;
	}
	
	.navbar{
		display: flex;
		height: 40px;
		padding: 0 5px;
		background: #fff;
		box-shadow: 0 1px 5px rgba(0,0,0,.06);
		position: relative;
		z-index: 10;
		.nav-item{
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 15px;
			color: $font-color-dark;
			position: relative;
			&.current{
				color: $base-color;
				&:after{
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 44px;
					height: 0;
					border-bottom: 2px solid $base-color;
				}
			}
		}
	}

	.uni-swiper-item{
		height: auto;
	}
	.order-item{
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;
		.i-top{
			display: flex;
			align-items: center;
			height: 80upx;
			padding-right:30upx;
			font-size: $font-base;
			color: $font-color-dark;
			position: relative;
			.time{
				flex: 1;
			}
			.state{
				// color: $base-color;
			}
			.del-btn{
				padding: 10upx 0 10upx 36upx;
				font-size: $font-lg;
				color: $font-color-light;
				position: relative;
				&:after{
					content: '';
					width: 0;
					height: 30upx;
					border-left: 1px solid $border-color-dark;
					position: absolute;
					left: 20upx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
		}
		/* 多条商品 */
		.goods-box{
			height: 160upx;
			padding: 20upx 0;
			white-space: nowrap;
			.goods-item{
				width: 120upx;
				height: 120upx;
				display: inline-block;
				margin-right: 24upx;
			}
			.goods-img{
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		/* 单条商品 */
		.goods-box-single{
			display: flex;
			padding: 20upx 0;
			.goods-img{
				display: block;
				width: 120upx;
				height: 120upx;
			}
			.right{
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0 30upx 0 24upx;
				overflow: hidden;
				.title{
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					line-height: 1;
				}
				.attr-box{
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 10upx 12upx;
				}
				.price{
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					&:before{
						content: '￥';
						font-size: $font-sm;
						margin: 0 2upx 0 8upx;
					}
				}
			}
		}
		
		.price-box{
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			padding: 20upx 30upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			.num{
				margin: 0 8upx;
				color: $font-color-dark;
			}
			.price{
				font-size: $font-lg;
				color: $font-color-dark;
				&:before{
					content: '￥';
					font-size: $font-sm;
					margin: 0 2upx 0 8upx;
				}
			}
		}
		.action-box{
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 100upx;
			position: relative;
			padding-right: 30upx;
		}
		.action-btn{
			width: 160upx;
			height: 60upx;
			margin: 0;
			margin-left: 24upx;
			padding: 0;
			text-align: center;
			line-height: 60upx;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			background: #fff;
			border-radius: 100px;
			&:after{
				border-radius: 100px;
			}
			&.recom{
				background: #fff9f9;
				color: $base-color;
				&:after{
					border-color: #f7bcc8;
				}
			}
		}
	}
	
	
	/* load-more */
	.uni-load-more {
		display: flex;
		flex-direction: row;
		height: 80upx;
		align-items: center;
		justify-content: center
	}
	
	.uni-load-more__text {
		font-size: 28upx;
		color: #999
	}
	
	.uni-load-more__img {
		height: 24px;
		width: 24px;
		margin-right: 10px
	}
	
	.uni-load-more__img>view {
		position: absolute
	}
	
	.uni-load-more__img>view view {
		width: 6px;
		height: 2px;
		border-top-left-radius: 1px;
		border-bottom-left-radius: 1px;
		background: #999;
		position: absolute;
		opacity: .2;
		transform-origin: 50%;
		animation: load 1.56s ease infinite
	}
	
	.uni-load-more__img>view view:nth-child(1) {
		transform: rotate(90deg);
		top: 2px;
		left: 9px
	}
	
	.uni-load-more__img>view view:nth-child(2) {
		transform: rotate(180deg);
		top: 11px;
		right: 0
	}
	
	.uni-load-more__img>view view:nth-child(3) {
		transform: rotate(270deg);
		bottom: 2px;
		left: 9px
	}
	
	.uni-load-more__img>view view:nth-child(4) {
		top: 11px;
		left: 0
	}
	
	.load1,
	.load2,
	.load3 {
		height: 24px;
		width: 24px
	}
	
	.load2 {
		transform: rotate(30deg)
	}
	
	.load3 {
		transform: rotate(60deg)
	}
	
	.load1 view:nth-child(1) {
		animation-delay: 0s
	}
	
	.load2 view:nth-child(1) {
		animation-delay: .13s
	}
	
	.load3 view:nth-child(1) {
		animation-delay: .26s
	}
	
	.load1 view:nth-child(2) {
		animation-delay: .39s
	}
	
	.load2 view:nth-child(2) {
		animation-delay: .52s
	}
	
	.load3 view:nth-child(2) {
		animation-delay: .65s
	}
	
	.load1 view:nth-child(3) {
		animation-delay: .78s
	}
	
	.load2 view:nth-child(3) {
		animation-delay: .91s
	}
	
	.load3 view:nth-child(3) {
		animation-delay: 1.04s
	}
	
	.load1 view:nth-child(4) {
		animation-delay: 1.17s
	}
	
	.load2 view:nth-child(4) {
		animation-delay: 1.3s
	}
	
	.load3 view:nth-child(4) {
		animation-delay: 1.43s
	}
	
	@-webkit-keyframes load {
		0% {
			opacity: 1
		}
	
		100% {
			opacity: .2
		}
	}
	.text-0{
		color: $base-color;
	}
	.text-1{
		color: $font-color-spec;
	}
	.text-2{
		color: $uni-color-success;
	}
	.text-3{
		color: $uni-color-primary;
	}
</style>
