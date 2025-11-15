const app = require('../app');
const request = require("supertest");

describe('Get Health', () => {
    test("returks status ok", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "ok"});
    });
});