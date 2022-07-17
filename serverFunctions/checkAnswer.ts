// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from "../../firebase/nodeApp";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkTriggers } from "../../serverFunctions/serverFunctions";

type Data = {
  response_type: string;
  message: string;
  dependentsSolved: boolean;
  solved: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const {
      game_id,
      tournament_id,
      team_id,
      user_id,
      answer_id,
      answer_guess
    } = req.body;
    console.log(
      "checking answer",
      game_id,
      team_id,
      user_id,
      answer_id,
      answer_guess
    );
    console.log("make reference", game_id + "/structure/");
    const answerRef = await admin
      .database()
      .ref(game_id + "/structure/answers/" + answer_id);
    // console.log("got ref", answerRef);
    // const answerQuery = await answerRef.once("value");
    // if (answerQuery) {
    //   console.log("exists");
    // } else {
    //   console.log(" not exists");
    // }
    // if (!answerQuery) {
    //   return {
    //     notFound: true,
    //   };
    // }
    // console.log("got ref to check", answerQuery);
    const snapshot = await answerRef.once("value");
    console.log("Does the snapshot exist?");
    console.log(snapshot.exists());
    if (!snapshot.exists()) {
      console.log("sending answer id not found");
      res.json({
        response_type: "notfound",
        message: "answer not found :" + answer_guess,
        dependentsSolved: false,
        solved: false
      });
    } else {
      // return snapshot.exists();
      const answerRecord = snapshot.val();
      console.log("got answer to check", answerRecord);

      const answerString = answerRecord["answer_string"];
      console.log(
        "checking guess for answer",
        "_" + answerString + "_",
        "_" + answer_guess + "_",
        answerString == answer_guess
      );
      const teamAnswerRef = await admin
        .database()
        .ref(
          `${game_id}/tournaments/${tournament_id}/teams/${team_id}/answers/${answer_id}`
        );
      const teamAnswerSnapshot = await teamAnswerRef.once("value");
      const teamAnswer = teamAnswerSnapshot.val();

      console.log("checking answer", answerRecord, teamAnswer);

      if (answerRecord == null) {
        console.log("sending no answer in structure");
        res.json({
          response_type: "notfound",
          message: "answer not found :" + answer_id,
          dependentsSolved: false,
          solved: false
        });
      } else if (teamAnswer != null && teamAnswer.solved == true) {
        console.log("sending already solved");
        res.json({
          response_type: "solvedbefore",
          message: "answer was solved before :" + answer_id,
          dependentsSolved: false,
          solved: false
        });
      } else if (answerString === answer_guess) {
        console.log("sending right answer");
        const answerSnapshot = await teamAnswerRef.update({
          solved: true,
          answer_id: answer_id,
          by: user_id,
          at: admin.database.ServerValue.TIMESTAMP
        });
        checkTriggers(game_id, tournament_id, team_id, user_id);
        res.json({
          response_type: "solvednow",
          message: "checked answer: " + answer_id,
          dependentsSolved: true,
          solved: true
          // triggers: answerRecord.fail,
        });
      } else {
        console.log("sending wrong");
        res.json({
          response_type: "notright",
          message: "guess was incorrect :" + answer_guess,
          dependentsSolved: false,
          solved: false
        });
      }
    }

    // Check if its already solved
    // let wasRight = false;
    // const answerDependents = answerRecord["answer_dependents"];
    // // Check dependents first
    // let dependentsAreSolved = true;
    // let dependentRecord, dependentVal;
    // if (typeof answerDependents === "string" && answerDependents !== "") {
    //   const dependentIds = answerDependents.split(",");
    //   for (let dependentId of dependentIds) {
    //     // eslint-disable-next-line no-await-in-loop
    //     console.log("checking dependent", dependentId);
    //     console.log(
    //       "answerDependents",
    //       answerDependents,
    //       FB_GAME_BASE + `/teams/${teamId}/answers/${dependentId}`
    //     );
    //     dependentRecord = await admin
    //       .database()
    //       .ref(FB_GAME_BASE + `/teams/${teamId}/answers/${dependentId}`)
    //       .once("value");
    //     dependentVal = dependentRecord.val();
    //     console.log("dependentVal", dependentVal);
    //     if (dependentVal.solved !== true) {
    //       dependentsAreSolved = false;
    //       break;
    //     }
    //   }
    // }
    // wasRight = false;
    // console.log("dependents are", dependentsAreSolved);
    // if (dependentsAreSolved === true) {
    //   // Check actual guess
    //   const answerString = answerRecord["answer_string"];
    //   console.log(
    //     "checking guess for answer",
    //     "_" + answerString + "_",
    //     "_" + answer_guess + "_"
    //   );
    //   console.log(
    //     "Answer Guess: ",
    //     answerString === answer_guess,
    //     answerString == answer_guess
    //   );

    // }
  } catch (err) {
    console.error(err); // will log the error with the error stack
    // res.json({
    //   response_type: "notfound",
    //   message: err,
    //   dependentsSolved: "false",
    //   solved: "false",
    // });
  }
}
