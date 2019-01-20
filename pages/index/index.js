/**
 * author chelfinn
 */
var bool = true;
Page({
  data: {
		hasList: false,    //购物车是否为空
		cart_count: 0,  //购物车初始数量
		edit_name: '编辑',
		red: false,
		edit: true,
		cart: [], //购物车列表
		selectAllStatus: true, //全选按钮的状态
		show: true,
		totalPrice: 0,
		cart_count: '',  // 购物车商品数量
		cart_id: '', //购物车id
		itemOne: '', //结算商品块
		goods_list: [],
		num: 0,
		
  }, 
	onLoad: function (){
		var that = this;
		that.carList();
	},
	/**
	* 获取购物车数据
	*/
	carList: function () {
		var that = this;
		wx.request({
			url: 'https://sudups.com/wx/cartlist.json',
			success: (res) => {
				if (res.data.code == 200) {
					var cart_id = '';
					var cart_list = res.data.datas.cart_list;
					var cart_count = res.data.datas.cart_count;
					var goods = [];
					for (var i in cart_list) {
						cart_list[i].selected = true; //选中店铺
						goods.push(cart_list[i].goods);
					}
					for (var j in goods) {
						for (var m in goods[j]) {
							goods[j][m].selected = true; //选中店铺下的商品
							cart_id += goods[j][m].cart_id + '|' + goods[j][m].goods_num + ',';
						}
					}
					var sum = res.data.datas.sum;
					if (cart_list.length > 0) {
						that.setData({
							cart: cart_list,
							cart_id: cart_id,
							cart_count: cart_count,
							hasList: true,
							totalPrice: sum,
						});
						that.getTotalPrice();
					}
				}
			},
			fail: () => {
				wx.showToast({
					title: '获取购物车失败',
					icon: 'none',
					duration: 2000
				})
			}
		});
	},
	// 购物车编辑
	btn_edit: function (res) {
		var that = this;
		var cart = that.data.cart;		
		if (bool) {
			for (var i in cart) {
				cart[i].selected = false;
				for (var j in cart[i].goods) {
					cart[i].goods[j].selected = false;
				}
			}
			that.setData({
				edit_name: "完成",
				edit: false,
				red: true,
				cart: cart,
				selectAllStatus: false,
				show: false,
			})
			bool = false;
		} else {
			that.setData({
				edit_name: "编辑",
				edit: true,
				red: false,
				show: true,
				selectAllStatus: true,
			})
			bool = true;
			that.onLoad();
		}
	},
	/**
   * 计算价钱
   */
	getTotalPrice() {
		var that = this;
		var cart = that.data.cart;     //获取购物车列表
		var itemOne = JSON.parse(JSON.stringify(cart)); //购物车选中类目
		let total = 0;
		var cart_id = '';
    //获取商品价格
		for (let i = 0; i < cart.length; i++) {      //循环列表中的每一项			
			if (cart[i].selected) {
				for (var j in cart[i].goods) {
					total += cart[i].goods[j].goods_num * cart[i].goods[j].goods_price;
					cart_id += cart[i].goods[j].cart_id + '|' + cart[i].goods[j].goods_num + ',';
				}
			} else {
				for (var j in cart[i].goods) {
					if (cart[i].goods[j].selected) {
						total += cart[i].goods[j].goods_num * cart[i].goods[j].goods_price;
						cart_id += cart[i].goods[j].cart_id + '|' + cart[i].goods[j].goods_num + ',';
					}
				}
			}
		}
    //获取要结算的商品块
		for (let i = itemOne.length - 1; i >= 0; i--) {      //循环列表中的每一项
			if (!itemOne[i].selected) {
				for (let j = itemOne[i].goods.length - 1; j >= 0; j--) {
					if (!itemOne[i].goods[j].selected) {
						itemOne[i].goods.splice(j, 1);
					}
				}
				// 如果店铺没有商品则删除店铺
				if (itemOne[i].goods.length == 0) {
					itemOne.splice(i, 1);
				}
			}
		}
		this.setData({
			cart: cart,
			itemOne: itemOne,
			totalPrice: total.toFixed(2),
			cart_id: cart_id
		});
	},
	/**
   * 全选事件--选择所有
   */
	selectAll: function (res) {
		var that = this;
		let selectAllStatus = this.data.selectAllStatus;
		selectAllStatus = !selectAllStatus;
		var cart = this.data.cart;
		for (let i = 0; i < cart.length; i++) {
			cart[i].selected = selectAllStatus;
			for (let j in cart[i].goods) {
				cart[i].goods[j].selected = selectAllStatus;
			}
		}
		this.setData({
			cart: cart,
			selectAllStatus: selectAllStatus
		});
		that.getTotalPrice();
	},
	/**
   * 选择--店铺所有商品
   */
	selectStoreGoods: function (res) {
		var that = this;
		var index = res.currentTarget.dataset.index;
		var cart = that.data.cart;
		var selectAllStatus = this.data.selectAllStatus;
		cart[index].selected = !cart[index].selected;
		for (var i in cart[index].goods) {
			cart[index].goods[i].selected = cart[index].selected;
		}
		if (cart[index].selected) {
			for (var i in cart) {
				if (!cart[i].selected) {
					selectAllStatus = false;
					break;
				} else {
					selectAllStatus = true;
				}
			}
		} else {
			selectAllStatus = false;
		}
		this.setData({
			cart: cart,
			selectAllStatus: selectAllStatus
		});
		that.getTotalPrice();
	},
	/**
   * 选择--勾选单个商品
   */
	selectList: function (res) {
		var that = this;
		var idx = res.currentTarget.dataset.idx;
		var index = res.currentTarget.dataset.index;
		var selectAllStatus = this.data.selectAllStatus;
		var cart = this.data.cart;
		cart[index].goods[idx].selected = !cart[index].goods[idx].selected;
		if (!cart[index].goods[idx].selected) {
			cart[index].selected = false;
			selectAllStatus = false;
		} else {
			for (let i in cart[index]) {
				for (let j in cart[index].goods) {
					if (!cart[index].goods[j].selected) {
						cart[index].selected = false;
						break;
					} else {
						cart[index].selected = true;
					}
				}
			}
			for (let i in cart) {
				if (!cart[i].selected) {
					selectAllStatus = false;
					break;
				} else {
					selectAllStatus = true;
				}
			}
		}
		this.setData({
			cart: cart,
			selectAllStatus: selectAllStatus
		});
		that.getTotalPrice();
	},
	// 购物车删除
	deleteList: function () {
		var that = this;
		let cart = that.data.cart;
		var cart_id = '';
		for (let i = cart.length - 1; i >= 0; i--) {      //循环列表中的每一项
			if (!cart[i].selected) {
				for (let j = cart[i].goods.length - 1; j >= 0; j--) {
					if (cart[i].goods[j].selected) {
						cart_id += cart[i].goods[j].cart_id + ','
						cart[i].goods.splice(j, 1);
					}
				}
				// 如果店铺没有商品则删除店铺
				if (cart[i].goods.length == 0) {
					cart.splice(i, 1);
				}
			} else {
				for (let j = cart[i].goods.length - 1; j >= 0; j--) {
					if (cart[i].goods[j].selected) {
						cart_id += cart[i].goods[j].cart_id + ','
					}
				}
				cart.splice(i, 1);
			}
		}
		that.setData({
			cart: cart,
		});
		cart_id = cart_id.substr(0, cart_id.length - 1)
		that.getTotalPrice(); //计算总价
	},

})
