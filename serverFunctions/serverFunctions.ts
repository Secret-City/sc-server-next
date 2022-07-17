import admin from "../firebase/nodeApp";

const checkTriggers = async (
  game_id: string | string[],
  tournament_id: string | string[],
  team_id: string | string[],
  user_id: string | string[]
) => {
  const triggerRef = await admin
    .database()
    .ref(game_id + "/structure/triggers/");
  const triggersSnapshot = await triggerRef.once("value");
  const gameTriggers = triggersSnapshot.val();
  console.log("checking triggers", gameTriggers);
  const teamRef = await admin
    .database()
    .ref(`${game_id}/tournaments/${tournament_id}/teams/${team_id}`);
  const teamSnapshot = await teamRef.once("value");
  let teamData = teamSnapshot.val();

  if (!teamData.triggers) {
    const triggerDefaults = Object.keys(gameTriggers).reduce(
      (a, v) => ({ ...a, [v]: { count: -1 } }),
      {}
    );
    await teamRef.update({
      triggers: triggerDefaults
    });
    teamData.triggers = triggerDefaults;
  }

  for (let triggerId in gameTriggers) {
    const gameTrigger = gameTriggers[triggerId];
    let triggerCount = -1;
    for (let triggerAnswerIndex in gameTrigger.answer_ids) {
      // Loop through answers to count solved
      let triggerAnswerId = gameTrigger.answer_ids[triggerAnswerIndex];
      if (
        teamData.answers[triggerAnswerId] &&
        teamData.answers[triggerAnswerId].solved == true
      )
        triggerCount++;
    }
    console.log(
      "new count for",
      triggerId,
      triggerCount,
      teamData.triggers[triggerId],
      teamData.triggers[triggerId].count,
      triggerCount > teamData.triggers[triggerId].count
    );
    if (triggerCount > -1) {
      // Compare solved to count in team data
      if (
        teamData.triggers[triggerId] &&
        teamData.triggers[triggerId].count != undefined &&
        triggerCount > teamData.triggers[triggerId].count
      ) {
        // If different, set next answer
        console.log("triggers advance", triggerId, triggerCount);

        await teamRef.child("triggers").child(triggerId).update({
          count: triggerCount
        });
        const answerIdToUpdate = gameTrigger.sequence[triggerCount];
        console.log(
          "triggers advance",
          triggerId,
          triggerCount,
          answerIdToUpdate
        );
        await teamRef.child("answers").child(answerIdToUpdate).update({
          solved: true,
          answer_id: answerIdToUpdate,
          by: user_id,
          at: admin.database.ServerValue.TIMESTAMP
        });
      }
    }
  }
};

export { checkTriggers };
