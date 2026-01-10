import { Express, Request, Response } from "express";

export class LoginController {
    constructor(private app: Express) {
        this.app.get("/login", this.login.bind(this));
    }

    private login(req: Request, res: Response) {
        res.json({
            user: {
                uuid: "guest-" + Math.random().toString(36).substring(7),
                email: "guest@localhost",
                username: "Guest",
                is_admin: false
            },
            accessToken: "dummy_token"
        });
    }
}

