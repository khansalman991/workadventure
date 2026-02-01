import { Express, Request, Response } from "express";

export class MapController {
    constructor(private app: Express) {
        this.app.get("/map", this.map.bind(this));
    }

    private map(req: Request, res: Response) {
        const playUri = req.query.playUri as string;
        if (!playUri) {
            res.status(400).send("Missing playUri");
            return;
        }
        res.json({
            mapUrl: process.env.START_ROOM_URL || "http://localhost:3000/map.json",
            authenticationMandatory: false
        });
    }
}