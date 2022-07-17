// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from "../../serverFunctions/firebase/nodeApp";
import type { NextApiRequest, NextApiResponse } from "next";
import { Reference } from "@firebase/database-types";

type Data = {
  response_type: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { game_id, tournament_id } = req.body;
    console.log("setting game_start", game_id, tournament_id);

    const teamsRef = await admin
      .database()
      .ref(`${game_id}/tournaments/${tournament_id}/teams/`);
    const teamsSnapshot = await teamsRef.once("value");
    const teamsData = teamsSnapshot.val();

    console.log("teamsData", teamsData);
    let teamUpdates = {} as any;
    for (let teamKey in teamsData) {
      const teamData = teamsData[teamKey];
      teamUpdates[teamKey + "/answers/game_start"] = {
        solved: true,
        answer_id: "game_start",
        by: "admin",
        at: admin.database.ServerValue.TIMESTAMP
      };
    }
    console.log("teamUpdates", teamUpdates);
    const answerSnapshot = await teamsRef.update(teamUpdates);
    res.json({
      response_type: "gamestarted"
    });
  } catch (err) {
    console.error(err); // will log the error with the error stack
  }
}
