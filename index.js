'use strict';
const { Client } = require('discord.js');
const axios = require('axios')
const DERPI_API_KEY = "DERPI_API_KEY"

const client = new Client();
async function process_response(message, img_id) {
    const author_id = message.author.id
    if (img_id!==undefined) {
        const derpi_url = `https://derpibooru.org/images/${img_id}`;
        message.channel.send(`<@!${author_id}> ${derpi_url}`);
    } else {
        message.channel.send(`<@!${author_id}> Not found 😢`);
    }
}
client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', async (message) => {
    if (message.content.includes("<@&724243572714635274>") || message.content.includes("<@!724240302797225997>")) {
        console.log("mentioned")
        const msg_id = message.content.slice(22).trim()
        if (isNaN(msg_id)) {
            return
        }
        try {
            let msg = await message.channel.messages.fetch(msg_id)
            msg.embeds.forEach(async (el) => {
                if(el.url.includes("https://derpicdn.net")){   //https://derpicdn.net/img/view/{year}/{month}/{day}/2378301.gif
                   const index_of_last_slash =  el.url.lastIndexOf("/") 
                   const index_of_last_dot =  el.url.lastIndexOf(".") 
                   const img_id=el.url.slice(index_of_last_slash+1,index_of_last_dot)
                   process_response(message, img_id)
                   return
                }
                if (el.url.includes("https://imgur.com/")) {
                    const index = el.url.indexOf("https://imgur.com/")
                    let img_id = el.url.slice(index + 18)
                    if (!img_id.includes(".")) {
                        img_id += ".jpg"
                    }
                    el.url = "https://i.imgur.com/" + img_id
                }
                const response = await axios.post(`https://derpibooru.org/api/v1/json/search/reverse?key=${DERPI_API_KEY}&url=${el.url}`);
                process_response(message, response.data.images[0]?.id)
            })

            msg.attachments.forEach(async (el) => {
                const response = await axios.post(`https://derpibooru.org/api/v1/json/search/reverse?key=${DERPI_API_KEY}&url=${el.attachment}`);
                process_response(message, response.data.images[0]?.id)
            })
        } catch (err) {
            console.log(err)
        }
    }

});

client.login('DISCORD_BOT_TOKEN');