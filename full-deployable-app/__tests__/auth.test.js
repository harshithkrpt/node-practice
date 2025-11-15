const request = require("supertest");

// adding mock functions
jest.mock('../services/userService', () => ({
    getUserService: jest.fn()
}));

const app = require('../app');
const { getUserService } = require('../services/userService');

describe("GET /auth/profile",() => {
    test('returns list of users', async () => {
        // Adjust this shape to whatever your route actually uses
        getUserService.mockResolvedValue([
        {
            id: 1,
            firstName: 'Harshith',
            lastName: 'Kurapati'
        }
        ]);

        const res = await request(app).get('/auth/profile');
        expect(res.body.message).toBe('No token provided');
        expect(res.statusCode).toBe(401);

    });
});