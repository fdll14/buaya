"use strict"
const { default:makeWASocket, AnyMessageContent, MessageType, delay, downloadMediaMessage, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } = require('@adiwajshing/baileys');
const app = require('express')();
const { writeFile }  = require('fs/promises')
const { Boom } = require('@hapi/boom')
const MAIN_LOGGER = require('@adiwajshing/baileys/lib/Utils/logger');
const { createSticker, StickerTypes } = require('wa-sticker-formatter')
const { exec } = require("child_process")
const pino = require('pino')
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const d_t = new Date();
const str_replace = require('str_replace');
const gTTS = require('gtts');
let seconds = d_t.getSeconds();
const translate = require('translate-google');
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	const { version, isLatest } = await fetchLatestBaileysVersion()
	const sock = makeWASocket({
		version,
		printQRInTerminal: true,
		auth: state,
		//msgRetryCounterMap,
		logger: pino({ level: 'silent', })
		
	})
sock.ev.process(
		async(events) => {
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(lastDisconnect?.error?.output?.statusCode === DisconnectReason.restartRequired) {
					startSock()
				}
				if(lastDisconnect?.error?.output?.statusCode === DisconnectReason.timedOut) {
					startSock()
				}
			}
			if(events['creds.update']) {
				await saveCreds()
			}
			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				//console.log('recv messages ', JSON.stringify(upsert, undefined, 2))
				
				if(upsert.type === 'notify') {
					try {
					for(const msg of upsert.messages) {   
						const body = (msg.message?.extendedTextMessage?.text);
						const group = (msg.message?.conversation);
						const namez = (msg.pushName);
						const didi = (msg.key.remoteJid)
						const didix = str_replace('@s.whatsapp.net','', didi)
						const alls = (msg.message?.extendedTextMessage?.text || msg.message?.conversation || msg.message?.listResponseMessage?.title || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption)
						const list = (msg.message?.listResponseMessage?.title);
						const stsx = (msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption);
						const sendMessageWTyping = async(msg, didi) => {
							await sock.presenceSubscribe(didi)
							await delay(500)

							await sock.sendPresenceUpdate('composing', didi)
							await delay(2000)

							await sock.sendPresenceUpdate('paused', didi)

							await sock.sendMessage(didi, msg)
						}
						console.log(`nomor : ${didix} nama : ${namez} [pesan : ${alls}]`)
						fs.appendFileSync('keyid.txt', ''+didix+'\n' ,(err)=> {
						  if(err){
							console.log('error',err);
						  }
						  //console.log('DONE');
						})
						//const stsx = (msg.message?.videoMessage?.caption);
						if(alls === 'menu' || alls === 'Menu' || alls === '.menu' || alls === 'p' || alls === 'P' ) {
							await sock.readMessages([msg.key])
							const buttons = [
							  {buttonId: 'id1', buttonText: {displayText: 'about buaya'}, type: 1},
							  {buttonId: 'id2', buttonText: {displayText: 'menu'}, type: 1},
							]
							const buttonMessage = {
								image: {url: './bucode2.png'},
 								caption : "intro bot mu",
								footerText: ' ',
								headerType: 4,
								buttons: buttons,
							}
							
							await sendMessageWTyping(buttonMessage, msg.key.remoteJid)
						}
						else if(msg.message?.buttonsResponseMessage?.selectedButtonId === 'id2' || body === 'menu' || group === 'menu' )
						{
	                    await sock.readMessages([msg.key])
	                        const sections = [
								{
								title: " ",
								rows: [
									{title:'how to use klik here'},
									{title:'tle aku cinta kamu'},
									{title:'tli another world'},
									{title:'spk test'}
								]
								},
							]
							  
							  const listMessage = {
							  text: "intro bot mu",
							  ListType: 2,
							  buttonText : "MENU",
							  sections
							}

							await sendMessageWTyping(listMessage, msg.key.remoteJid)
						}
                        else if (msg.message?.buttonsResponseMessage?.selectedButtonId === 'id1'){
                            await sock.readMessages([msg.key])
                            await sendMessageWTyping({text: "Halo perkenalkan saya buaya yang dapat bekerja selama 24 jam untuk mengatur group yang kalian miliki.\n\n\Untuk menyewa bot ini kalian bisa menghubungi pemilik saya di menu. \n\n version bot : v0.0.1"}, msg.key.remoteJid)
                        }
						else if (alls?.startsWith('cl')){
							const txt = (alls?.split("|")[1])
							const it = (alls?.split("|")[2])
							//console.log(`${it} ${txt}`)
							await sock.readMessages([msg.key])
							await sendMessageWTyping({text: `${txt}`}, it)
                        }
						else if (body === '1' || group === '1'){
                            await sock.readMessages([msg.key])
							
                            await sendMessageWTyping({text: "hallo"}, msg.key.remoteJid)
                        }
						else if (alls?.startsWith('tle') || alls?.startsWith('Tle')){
                            await sock.readMessages([msg.key])
							const it = (list?.slice(4) || body?.slice(4) || group?.slice(4))
							translate(''+it+'', {from: 'auto', to: 'en'}).then( async res => {
								console.log(res)
								await sendMessageWTyping({text: `${res}`}, msg.key.remoteJid)
							}).catch( async err => {
								console.error(err)
								await sendMessageWTyping({text: `${err}`}, msg.key.remoteJid)
							})
                        }
						else if (alls?.startsWith('tli') || alls?.startsWith('Tli')){
                            await sock.readMessages([msg.key])
							const it = (list?.slice(4) || body?.slice(4) || group?.slice(4))
							translate(''+it+'', {from: 'auto', to: 'id'}).then( async res => {
								console.log(res)
								await sendMessageWTyping({text: `${res}`}, msg.key.remoteJid)
							}).catch( async err => {
								console.error(err)
								await sendMessageWTyping({text: `${err}`}, msg.key.remoteJid)
							})
                        }
						else if (alls?.startsWith('spk') || alls?.startsWith('Spk')){
                            await sock.readMessages([msg.key])
							const it = (list?.slice(4) || body?.slice(4) || group?.slice(4))
							if (it === ''){
							await sendMessageWTyping({text: `kata-kata nya kakak belom`}, msg.key.remoteJid)
							}
							else {
								//const speech = ``+ it +`` ;
								console.log(it)
								const name = Math.random();
								const gtts = new gTTS(it, 'id');
								gtts.save(`./content/${name}.mp3`, function (err, result){
									if(err) { throw new Error(err); }
									console.log("Text to speech converted!");
									async function spkz(){
									await sendMessageWTyping({audio: {url: `./content/${name}.mp3`}, mimetype: 'audio/mp4'}, msg.key.remoteJid)
									}
									spkz()
								});
								
								 
							}
                        }
						else if (alls?.startsWith('fc') || alls?.startsWith('Fc')){
                            await sock.readMessages([msg.key])
							const fcz = (list?.slice(2) || body?.slice(2) || group?.slice(2))
							const fcx = (list?.slice(3) || body?.slice(3) || group?.slice(3))
							console.log(msg.key.remoteJid);
							if (msg.key.remoteJid === '62xxx(owner number)@s.whatsapp.net'){
							const { exec } = require("child_process")
							exec(""+fcz+"", async(error, stdout, stderr) => {
								if (error) {
									console.log(`error: ${error.message}`);
									//return;
									await sendMessageWTyping({text: `${stdout}`}, msg.key.remoteJid)
								}
								if (stderr) {
									console.log(`stderr: ${stderr}`);
									//return;
									await sendMessageWTyping({text: `${stdout}`}, msg.key.remoteJid)
								}
								//console.log(`stdout: ${stdout}`);
								await sendMessageWTyping({text: `${stdout}`}, msg.key.remoteJid)
							})	
						}
							else if(msg.key.remoteJid !== '62xxx(owner number)@s.whatsapp.net'){
								await sendMessageWTyping({text: `who who calm dawn man`}, msg.key.remoteJid)
							}
												
                        }
						
					}
					
				}
				catch (e) {
					console.log(e);
					}
				}
			
			}
		}
	)

	return sock
}

startSock()