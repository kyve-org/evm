const Discord = require("webhook-discord");
const client = new Discord.Webhook(process.env.DISCORD);

const message = new Discord.MessageBuilder()
  .setColor("#58C6B2")
  .setTitle(":new: New Release :new:")
  .setDescription(`\`@kyve/evm\` ${process.env.VERSION} released.`)
  .setURL(
    `https://github.com/KYVENetwork/evm/releases/tag/${process.env.VERSION}`
  )
  .setName("Release Bot");

client.send(message);
