"use strict";
import {Context, Service, ServiceBroker, ServiceSchema} from "moleculer";

import DbConnection from "../mixins/db.mixin";

export default class CartService extends Service{

	private DbMixin = new DbConnection("cart").start();

	// @ts-ignore
	public  constructor(public broker: ServiceBroker, schema: ServiceSchema<{}> = {}) {
		super(broker);
		this.parseServiceSchema(Service.mergeSchemas({
			name: "cart",
			mixins: [this.DbMixin],
			settings: {
				idField:[
					"productId"
				],
				// Available fields in the responses
				fields: [
					"productId",
					"addedDate"
				],

				// Validator for the `create` & `insert` actions.
				entityValidator: {
					productId: "string",
					addedDate: "string"
				},
			},
			hooks: {
				before: {
					/**
					 * Register a before hook for the `create` action.
					 * It sets a default value for the totalprice field.
					 *
					 * @param {Context} ctx
					 */
					create: async (ctx: Context<{ productId: string, addedDate: string }>) => {
						const productExists = await this.adapter.findOne({productId: ctx.params.productId});
						if(!productExists){
							ctx.params.addedDate = new Date().toDateString();
						}else{
							throw "Product is already added";
						}
					},
				},
			},
			actions: {
				/**
				 * The "moleculer-db" mixin registers the following actions:
				 *  - list
				 *  - find
				 *  - count
				 *  - create
				 *  - insert
				 *  - update
				 *  - remove
				 */
				// --- ADDITIONAL ACTIONS ---

				/**
				 * Get cart summary 
				 */
				getSummary: {
					rest: "GET /summary",
					params: {},
					async handler(ctx: Context) {
						let result:any = [];
						let totalPrice = 0;
						const list: any = await this.adapter.find();
						let productData: any = [];
						const products: any = await broker.call("products.find");
						await list.forEach(async (item: { _id: any; }) => {
							console.log(item);
							const product = await products.find((x:any)=>x._id===item._id);
							console.log(product);
							totalPrice = totalPrice + parseInt(product.price);
							productData.push(product);
						});
						console.log(productData);
						result.push({"productDetails": productData});
						result.push({"totalprice": totalPrice});
						// const json = await this.transformDocuments(result);
						return result;
					},
				},
				/**
 				* Remove productId 
 				*/
				removeProduct: {
					rest: "POST /remove/:id",
					params: { productId: "string" },
					async handler(ctx: Context<{ productId: string }>) {
						const result = await this.adapter.removeById(ctx.params.productId);
						return "Product is removed from Cart";
					}
				},
			},
			methods: {
				/**
				 * Loading sample data to the collection.
				 * It is called in the DB.mixin after the database
				 * connection establishing & the collection is empty.
				 */
				// async seedDB() {
				// 	await this.adapter.insertMany([
				// 	]);
				// },
			},
			/**
			 * Loading sample data to the collection.
			async afterConnected() {
			 await this.adapter.collection.createIndex({ name: 1 });
			},
			 */
		}, schema));
	}
}
