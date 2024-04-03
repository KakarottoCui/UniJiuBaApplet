<template>
	<view class="content">
		<scroll-view scroll-y class="left-aside">
			<view v-for="(item,index) in typeList" :key="item.id" class="f-item b-b" :class="{active: selIndex == index}" @click="tabtap(item,index)">
				{{item.groupName}}
			</view>
		</scroll-view>
		<scroll-view scroll-with-animation scroll-y class="right-aside" @scroll="asideScroll" :scroll-top="tabScrollTop">
			<view>
				<text class="s-item">{{typeList[selIndex].groupName}}</text>
				<view class="t-list">
					<view @click="navToDetailPage(item)" class="t-item" v-for="item in goodsList" :key="item.id">
						<image :src="filePath + item.pic"></image>
						<text>{{item.title}}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import appRequest from "../../common/appRequestUrl.js";
	export default {
		data() {
			return {
				sizeCalcState: false,
				tabScrollTop: 0,
				currentId: 0,
				flist: [],
				slist: [],
				tlist: [],
				goodsList:[],
				typeList:[],
				filePath:appRequest.urlMap.getFile,
				selType:{},
				selIndex:0
			}
		},
		onLoad(){
			//this.loadData();
			this.getTypeList();
		},
		methods: {
			navToDetailPage(item) {
				//测试数据没有写id，用title代替
				let id = item.id;
				uni.navigateTo({
					url: `/pages/product/product?id=${id}`
				})
			},
			getGoods(type){
				let _this = this;
				appRequest.request({
				  data: {
				    validFlag: 1,
					state:1,
					type:type
				  },
				  url: appRequest.urlMap.findNmGoodsList,
				  success: function(res) {
				    if (res.data.code == 200) {
				      _this.goodsList = res.data.data;
				    } else {
				      appRequest.msg(res.data.msg);
				    }
				  },
				  fail: function(res) {
				   appRequest.msg("网络异常");
				  }
				});
			},
			getTypeList(){
				let _this = this;
				appRequest.request({
				  data: {
				    validFlag: 1
				  },
				  url: appRequest.urlMap.findNmGoodsTypeList,
				  success: function(res) {
				    if (res.data.code == 200) {
				      _this.typeList = res.data.data;
					  _this.getGoods( _this.typeList[0].id)
				    } else {
				      appRequest.err(res.data.msg);
				    }
				  },
				  fail: function(res) {
				    appRequest.err("网络异常");
				  }
				})
			},
			async loadData(){
				let list = await this.$api.json('cateList');
				list.forEach(item=>{
					if(!item.pid){
						this.flist.push(item);  //pid为父级id, 没有pid或者pid=0是一级分类
					}else if(!item.picture){
						this.slist.push(item); //没有图的是2级分类
					}else{
						this.tlist.push(item); //3级分类
					}
				}) 
			},
			//一级分类点击
			tabtap(item,selindex){
				this.getGoods(item.id)
				if(!this.sizeCalcState){
					this.calcSize();
				}
				this.selIndex = selindex;
				this.currentId = item.id;
				let index = this.slist.findIndex(sitem=>sitem.pid === item.id);
				this.tabScrollTop = this.slist[index].top;
				
			},
			//右侧栏滚动
			asideScroll(e){
				if(!this.sizeCalcState){
					this.calcSize();
				}
				let scrollTop = e.detail.scrollTop;
				let tabs = this.slist.filter(item=>item.top <= scrollTop).reverse();
				if(tabs.length > 0){
					this.currentId = tabs[0].pid;
				}
			},
			//计算右侧栏每个tab的高度等信息
			calcSize(){
				let h = 0;
				this.slist.forEach(item=>{
					let view = uni.createSelectorQuery().select("#main-" + item.id);
					view.fields({
						size: true
					}, data => {
						item.top = h;
						h += data.height;
						item.bottom = h;
					}).exec();
				})
				this.sizeCalcState = true;
			},
			navToList(sid, tid){
				uni.navigateTo({
					url: `/pages/product/list?fid=${this.currentId}&sid=${sid}&tid=${tid}`
				})
			}
		}
	}
</script>

<style lang='scss'>
	page,
	.content {
		height: 100%;
		background-color: #f8f8f8;
	}

	.content {
		display: flex;
	}
	.left-aside {
		flex-shrink: 0;
		width: 200upx;
		height: 100%;
		background-color: #fff;
	}
	.f-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100upx;
		font-size: 28upx;
		color: $font-color-base;
		position: relative;
		&.active{
			color: $base-color;
			background: #f8f8f8;
			&:before{
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				height: 36upx;
				width: 8upx;
				background-color: $base-color;
				border-radius: 0 4px 4px 0;
				opacity: .8;
			}
		}
	}

	.right-aside{
		flex: 1;
		overflow: hidden;
		padding-left: 20upx;
	}
	.s-item{
		display: flex;
		align-items: center;
		height: 70upx;
		padding-top: 8upx;
		font-size: 28upx;
		color: $font-color-dark;
	}
	.t-list{
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		background: #fff;
		padding-top: 12upx;
		&:after{
			content: '';
			flex: 99;
			height: 0;
		}
	}
	.t-item{
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 176upx;
		font-size: 26upx;
		color: #666;
		padding-bottom: 20upx;
		
		image{
			width: 140upx;
			height: 140upx;
		}
	}
</style>
