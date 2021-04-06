"use strict";
import {Context, Service, ServiceBroker, ServiceSchema} from "moleculer";

import DbConnection from "../mixins/db.mixin";

export default class UserService extends Service{

	private DbMixin = new DbConnection("users").start();

	// @ts-ignore
	public  constructor(public broker: ServiceBroker, schema: ServiceSchema<{}> = {}) {
		super(broker);
		this.parseServiceSchema(Service.mergeSchemas({
			name: "users",
			mixins: [this.DbMixin],
			settings: {
				// Available fields in the responses
				fields: [
					"_id",
					"name",
					"email",
					"password"
				],

				// Validator for the `create` & `insert` actions.
				entityValidator: {
					name: "string|min:3",
					email: "string|email",
					password: "string|min:5",
				},
			}, 
			hooks: {
				// before: {
				// 	/**
				// 	 * Register a before hook for the `create` action.
				// 	 * It sets a default value for the quantity field.
				// 	 *
				// 	 * @param {Context} ctx
				// 	 */
				// 	create: (ctx: Context<{ quantity: number }>) => {
						
				// 	},
				// },
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
				* Decrease the quantity of the product item.
				**/
				login: {
					rest: "POST /login",
					params: {
						email: "string",
						// @ts-ignore
						password: "string",
					},
					/** @param {Context} ctx  */
					async handler(ctx: Context<{ email: string; password: number }>) {
						const doc = await this.adapter.findOne({ 
							email: ctx.params.email,
							password: ctx.params.password 
						});
						const json = await this.transformDocuments(ctx, ctx.params, doc);
						console.log(json);
						return json;
					},
				},
			},
			methods: {
				/**
				 * Loading sample data to the collection.
				 * It is called in the DB.mixin after the database
				 * connection establishing & the collection is empty.
				 */
				async seedDB() {
					await this.adapter.insertMany([
						{ name: "Test1", email: "test1@gmail.com", password: "test12345" },
					]);
				},
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
