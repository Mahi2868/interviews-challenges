"use strict";

process.env.TEST = "true";

import { Context, Errors, ServiceBroker } from "moleculer";
import UserService from "../../../services/user.service";

describe("Test 'user' service", () => {

	describe("Test actions", () => {
		const broker = new ServiceBroker({ logger: false });
		const service = broker.createService(UserService);

		jest.spyOn(service.adapter, "updateById");
		jest.spyOn(service, "transformDocuments");
		jest.spyOn(service, "entityChanged");

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		const record = {
			_id: "jAg4GXWOJABCtBXt",
			name: "Test1",
			password: "Welcome1"
		  }

		describe("Test 'users.update'", () => {

			it("should call the adapter updateById method & transform result", async () => {
				service.adapter.updateById.mockImplementation(async () => record);
				service.transformDocuments.mockClear();
				service.entityChanged.mockClear();

				const res = await broker.call("users.update", {
					_id: "jAg4GXWOJABCtBXt",
					name: "Test1",
					password: "Welcome"
				});
				expect(res).toEqual({
					_id: "jAg4GXWOJABCtBXt",
					name: "Test1",
					email: "test1@gmail.com",
					password: "Welcome"
				  });

				expect(service.transformDocuments).toBeCalledTimes(1);
				expect(service.transformDocuments).toBeCalledWith(expect.any(Context), { id: "jAg4GXWOJABCtBXt", password: "Welcome" }, record);

				expect(service.entityChanged).toBeCalledTimes(1);
				expect(service.entityChanged).toBeCalledWith("updated", { _id: "jAg4GXWOJABCtBXt", name: "Test1", email: "test1@gmail.com", password: "Welcome" }, expect.any(Context));
			});

		});

	});

	describe("Test methods", () => {
		const broker = new ServiceBroker({ logger: false });
		const service = broker.createService(UserService);

		jest.spyOn(service.adapter, "insertMany");
		jest.spyOn(service, "seedDB");

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		describe("Test 'seedDB'", () => {

			it("should be called after service started & DB connected", async () => {
				expect(service.seedDB).toBeCalledTimes(1);
				expect(service.seedDB).toBeCalledWith();
			});

			it("should insert 2 documents", async () => {
				expect(service.adapter.insertMany).toBeCalledTimes(1);
				expect(service.adapter.insertMany).toBeCalledWith([
					{ name: "Test1", email: "test1@gmail.com", password: "Welcome1" },
					{ name: "Test2", email: "test2@gmail.com", password: "Welcome2" },
				]);
			});

		});

	});

	describe("Test hooks", () => {
		const broker = new ServiceBroker({ logger: false });
		const createActionFn = jest.fn();
		// @ts-ignore
		broker.createService(UserService, {
			actions: {
				create: {
					handler: createActionFn,
				},
			},
		});

		beforeAll(() => broker.start());
		afterAll(() => broker.stop());

		describe("Test before 'create' hook", () => {

			it("should add quantity with zero", async () => {
				await broker.call("users.create", {
					name: "Test1",
					email: "test1@gmail.com",
					password: "Welcome1"
				  });

				expect(createActionFn).toBeCalledTimes(1);
				expect(createActionFn.mock.calls[0][0].params).toEqual({
					_id: "jAg4GXWOJABCtBXt",
					name: "Test1",
					email: "test1@gmail.com",
					password: "Welcome1"
				  });
			});

		});

	});

});
