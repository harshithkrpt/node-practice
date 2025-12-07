import { Router } from "express";
import UserService from "../../services/userService.js";

const router = Router();

router.post("/add", async (req, res) => {
    const { firstName, lastName = null } = req.body;

    if (!firstName) {
        res.status(400).send({
            message: 'Error'
        });
        return;
    }
    
    try {
        const result =  await UserService.addUser({ firstName, lastName });
        console.log(result);
        res.json(result);
    }
    catch(err) {
        console.error(err);
        res.status(500).send({
            message: 'Error'
        });
        return;
    }
});

export default router;