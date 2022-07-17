import admin from "../../serverFunctions/firebase/nodeApp";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  response_type: string;
  message: string;
  item_values: { [key: string]: any };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { game_id, tournament_id, team_id, user_id, item_ids } = req.body;

  console.log("loading items", req.body);

  let item_values: { [key: string]: any } = {};
  for (let item_id of item_ids) {
    item_values["/" + item_id + "/item_id/"] = item_id;
    item_values["/" + item_id + "/by/"] = user_id;
    item_values["/" + item_id + "/visible/"] = true;
    item_values["/" + item_id + "/at/"] = new Date().getTime();
    // {
    //   item_id: item_id,
    //   by: user_id,
    //   visible: true,
    //   at: new Date().getTime(),
    // };
  }

  const itemSnapshot = await admin
    .database()
    .ref(game_id + `/tournaments/${tournament_id}/teams/${team_id}/items/`) //${data.item_id}
    .update(item_values);

  // response.send({
  //   message: "loading item: " + request.query.item_id,
  //   // triggers: answerRecord.fail,
  // });
  res.json({
    response_type: "itemadded",
    message: "items added to team:" + team_id,
    item_values: item_values
  });
}
