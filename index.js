const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const DB_FILE = './db.json';
const getDB = () => JSON.parse(fs.existsSync(DB_FILE) ? fs.readFileSync(DB_FILE, 'utf8') : '{}');
const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

function getGuildData(guildId) {
    let db = getDB();
    if (!db.guilds) db.guilds = {};
    if (!db.guilds[guildId]) db.guilds[guildId] = { joinChannel: null, leaveChannel: null, joinMsg: '👋 {user} sunucuya hoş geldin!', leaveMsg: '😢 {user} aramızdan ayrıldı.' };
    return db.guilds[guildId];
}

let isMaintenance = false;

client.once('ready', () => console.log(`${client.user.tag} aktif!`));

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // ===== SEVIYE SISTEMI =====
    let db = getDB();
    if (!db[message.author.id]) db[message.author.id] = { balance: 0, lastDaily: 0, xp: 0, level: 1 };
    db[message.author.id].xp += Math.floor(Math.random() * 11) + 5;
    if (db[message.author.id].xp >= db[message.author.id].level * 100) {
        db[message.author.id].level++;
        db[message.author.id].xp = 0;
        message.channel.send(`🎉 Tebrikler <@${message.author.id}>, **${db[message.author.id].level}.** seviyeye ulaştın!`);
    }
    saveDB(db);

    // ===== CHATBOT (Prefixsiz) =====
    const chatMap = {
        'ceycey': 'Efendim',
        'naber': 'İyi sen?',
        'iyi bende': 'e güzel. yardım ihtiyaç olursa buradayım!',
        'nasıl konuşuyorsun': 'Ağzımla!',
        'sus': 'Tamam.',
        'senin adın ne': 'Benim Adım Ceycey!',
        'bak adam ol': 'Sen adam ol!',
        'seni öpebilir miyim': 'Yapabilirsen!',
        'öğürsemiş tosun': 'Sensin o!',
        'seni sikeceğim': 'Tamam!',
        'selamın aleyküm': 'Aleyküm selam!',
        'selamun aleyküm': 'Aleyküm selam!',
        'sa': 'Aleyküm selam!',
        'ne diyon ki': 'Birşey demiyorum ki!',
        'düzelt çabuk şu hatayı': 'Benim elimde değil, kendiliğinden hata veriyor!',
        'nasılsın': 'İyiyim.',
        'ne yapıyorsun': 'Oturuyorum, sizi izliyorum.👽',
        'tamam': 'Tamam.',
        'nasıl konuşuyorsun?': 'Ağzımla!',
        'ne diyon ki?': 'Birşey demiyorum.',
        'nasılsın?': 'İyiyim.',
        'ne yapıyorsun?': 'Oturuyorum, sizi izliyorum.👽',
        'tamam.': 'Tamam.',
        'iyi bende': 'e güzel. yardım ihtiyaç olursa buradayım!',
        'senin adın ne?': 'Ceycey?',
        ':middle_finger:': 'Tamam.'
    };
    const userMsg = message.content.toLowerCase();
    if (chatMap[userMsg]) {
        await message.channel.sendTyping();
        setTimeout(async () => await message.reply(chatMap[userMsg]), 1000);
        return;
    }

    // ===== PREFIXSIZ KOMUTLAR =====
    if (userMsg === 'ceylinkimdir?') {
        const embed = new EmbedBuilder()
            .setTitle('𝐂𝐞𝐲𝐥𝐢𝐧 𝐊𝐢𝐦𝐝𝐢𝐫? <@1273996127943004251>')
            .setDescription('𝐂𝐞𝐲𝐥𝐢𝐧 𝟏𝟒 𝐲𝐚𝐬𝐢𝐧𝐝𝐚 𝐘𝐨𝐮𝐭𝐮𝐛𝐞𝐝𝐞 𝟖𝐤 𝐚𝐛𝐨𝐧𝐞𝐬𝐢 𝐨𝐥𝐚𝐧 𝐧𝐚𝐳𝐢𝐤 𝐯𝐞 𝐭𝐚𝐭𝐥𝐢𝐬 𝐛𝐢𝐫 𝐤𝐢𝐳. 𝐚𝐫𝐤𝐚𝐝𝐚𝐬𝐥𝐚𝐫𝐢𝐧𝐚 𝐤𝐚𝐫𝐬𝐢 𝐜𝐨𝐤 𝐬𝐚𝐦𝐢𝐦𝐢𝐝𝐢𝐫 𝐯𝐞 𝐤𝐢𝐦𝐬𝐞𝐲𝐢 𝐮𝐳𝐦𝐞𝐳.')
            .setFooter({ text: '𝐂𝐞𝐲𝐥𝐢𝐧 = 𝐓𝐚𝐭𝐥𝐢𝐥𝐢𝐤💗' })
            .setColor(0x001c8b)
            .setThumbnail('https://cdn.discordapp.com/attachments/1266445451650007182/1414707722242359306/Baslksz34_20250909002300.png?ex=68c08cbc&is=68bf3b3c&hm=d4e3b51c74e76505e347fbbd8aa0e0c6103197130b2b53df4c04d75fc7b8c4b3&');
        return message.reply({ embeds: [embed] });
    }

    if (userMsg === 'canlı') {
        await message.delete().catch(() => {});
        const embed = new EmbedBuilder()
            .setDescription('𝐂𝐞𝐲𝐥𝐢𝐧𝐢𝐧 𝟗 𝐬𝐚𝐚𝐭𝐥𝐢𝐤 𝐜𝐚𝐧𝐥𝐢 𝐲𝐚𝐲𝐢𝐧𝐢𝐧𝐢𝐧 𝐬𝐬\'𝐢. 𝐚𝐥 𝐛𝐞𝐥𝐤𝐢 𝐥𝐚𝐳𝐢𝐦 𝐨𝐥𝐮𝐫')
            .setImage('https://cdn.discordapp.com/attachments/1266445451650007182/1414954066349527070/Screenshot_20250909_164210.jpg?ex=68c17229&is=68c020a9&hm=c17d8fa3ff1288564b339c7c31017cf71b01aa760384b1f94b21c07c3ce3c5c3&')
            .setColor(0xff84b4);
        return message.channel.send({ embeds: [embed] });
    }

    if (userMsg === 'aktifolmak') {
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        await message.delete().catch(() => {});
        return message.channel.send('Aktif ola bilirmisiniz?💝😻');
    }

    if (userMsg === 'foto') {
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        await message.delete().catch(() => {});
        const embed = new EmbedBuilder()
            .setImage('https://cdn.discordapp.com/attachments/1266445451650007182/1515977196802539571/Screenshot_20260615_111008.jpg?ex=6a30f749&is=6a2fa5c9&hm=8a70767d9d66e95d69fad44a6cb4c3d87d7f1450b03e5dbe409eb34217f84566&');
        return message.channel.send({ content: '@everyone & @here', embeds: [embed], allowedMentions: { parse: ['everyone', 'roles', 'users'] } });
    }

    // ===== C! PREFIXLI KOMUTLAR =====
    if (!message.content.startsWith('C!')) return;
    const args = message.content.slice(2).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    let commandFound = false;

    if (isMaintenance && message.author.id !== '1200687946827837453') return message.reply('❌ Şuan Bot\'a Bakım Yapılıyor Lütfen Daha Sonra Tekrar Dene!');

    // ---- C!yardim (Kategorili) ----
    if (command === 'yardim') {
        commandFound = true;
        if (isMaintenance) return message.reply('❌ Şuan Bot\'a Bakım Yapılıyor Lütfen Daha Sonra Tekrar Dene!');

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.user.username} > Yardım Menüsü`, iconURL: client.user.displayAvatarURL() })
            .setColor(0x0099ff)
            .addFields(
                { name: '⚜️ Admin', value: '`C!ban` `C!forceban` `C!forceunban` `C!kick` `C!timeout` `C!lock` `C!unlock` `C!rolver` `C!rolal` `C!sil`', inline: false },
                { name: '🎈 Kullanıcı', value: '`C!ship` `C!zar` `C!hava` `C!iq` `C!karne` `C!deprem` `C!sunucubilgi` `C!sb` `C!seviye` `C!rank`', inline: false },
                { name: '💵 Ekonomi', value: '`C!bal` `C!cf` `C!s` `C!daily`', inline: false },
                { name: '🔧 Diğer', value: '`C!yapicim` `C!konus` `C!etiketlemek` `C!onemli` `C!cesur` `C!çamlıcakulesi` `C!giris-cikis` `C!anket` `C!random` `C!bakim-ac` `C!bakim-kapat`', inline: false }
            );

        return message.reply({ embeds: [embed] });
    }

    // ---- C!yapicim ----
    if (['yapicim', 'yapimci', 'yapımcı', 'yapımcın'].includes(command)) {
        commandFound = true;
        const embed = new EmbedBuilder()
            .setTitle('Yapımcın kim? <@1200687946827837453> / `Yan Yapımcı <@1402724852330139699>`')
            .setDescription('𝐘𝐚𝐩𝐢𝐦𝐜𝐢𝐦 𝐌𝐞𝐥𝐢𝐬 𝐚𝐝𝐥𝐢 𝐤𝐮𝐥𝐥𝐚𝐧𝐢𝐜𝐢\n𝐛𝐞𝐧𝐢 𝐨 𝐭𝐚𝐬𝐚𝐫𝐥𝐚𝐝𝐢 :𝟑.𝐇𝐚𝐭𝐭𝐚 𝐤𝐞𝐧𝐝𝐢𝐬𝐢 𝐑-𝐭𝐮𝐛𝐞𝐫 𝐤𝐚𝐧𝐚𝐥𝐢𝐧𝐢𝐧 𝐢𝐬𝐦𝐢𝐝𝐞 𝐑𝐨𝐛𝐥𝐨𝐱𝐌𝐞𝐥𝐬𝐢')
            .setFooter({ text: '𝐌𝐞𝐥𝐢𝐬 = 𝐘𝐚𝐩𝐢𝐦𝐜𝐢𝐦 ⚒️' })
            .setColor(0xFFD1DC)
            .setThumbnail('https://cdn.discordapp.com/attachments/1266445451650007182/1447989354462052393/Upfoto_bvvDXlQSVg4fGJsy92HK4bHsOY2FkFU4zcoGJWI3pvvNU.jpg?ex=6939a0ac&is=69384f2c&hm=0afabdd9bb6c00ea117091c301c6a92824bd4441ed879304df08491e5f2ea82e&');
        return message.reply({ embeds: [embed] });
    }

    // ---- C!konus ----
    if (command === 'konus') {
        commandFound = true;
        if (message.author.id !== '1200687946827837453') return message.reply('𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?');
        await message.delete().catch(() => {});
        const text = args.join(' ');
        if (text) message.channel.send(`**${text}**`);
    }

    // ---- C!etiketlemek ----
    if (['etiketle', 'etiketlemek'].includes(command)) {
        commandFound = true;
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        await message.delete().catch(() => {});
        const text = args.join(' ');
        message.channel.send({ content: `${text}\n@everyone & @here`, allowedMentions: { parse: ['everyone', 'roles', 'users'] } });
    }

    // ---- C!cesur ----
    if (command === 'cesur') {
        commandFound = true;
        const embed = new EmbedBuilder()
            .setTitle('𝐂𝐞𝐬𝐮𝐫 𝐊𝐢𝐦𝐝𝐢𝐫? <@1380502758460751872>')
            .setDescription('𝐂𝐞𝐬𝐮𝐫 𝐝𝐨𝐨𝐫𝐬𝐚 𝐯𝐞 𝐟𝐨𝐫𝐬𝐚𝐤𝐞𝐧𝐞 𝐭𝐚𝐤𝐢𝐧𝐭𝐢𝐥𝐢 𝐛𝐢𝐫𝐢𝐝𝐢𝐫 𝐲𝐨𝐥𝐝𝐚 𝐤𝐚𝐫𝐬𝐢𝐧𝐢𝐳𝐚 𝐜𝐢𝐤𝐚𝐫𝐬𝐚 𝟏𝐱𝟏𝐱𝟏𝐱𝟏𝐱 𝐨𝐥𝐮𝐩 𝐬𝐢𝐳𝐢 𝐢𝐤𝐢𝐲𝐞 𝐛𝐨𝐥𝐞 𝐛𝐢𝐥𝐢𝐫🥰')
            .setFooter({ text: '𝐂𝐞𝐬𝐮𝐫 = 𝐅𝐨𝐫𝐬𝐚𝐤𝐞𝐧,𝐃𝐨𝐨𝐫𝐬 𝐭𝐚𝐤𝐢𝐧𝐭𝐢𝐥𝐢𝐬𝐢' })
            .setColor(0x00662b)
            .setThumbnail('https://cdn.discordapp.com/attachments/1266445451650007182/1414708962288341082/a513bafa3d873d2b16268a393d79aac9.jpg?ex=68c08de4&is=68bf3c64&hm=0d648a2c2351d1597f116f0385e735a6c426ea0723e5f5745bd890dbe1560689&');
        return message.reply({ embeds: [embed] });
    }

    // ---- C!sil ----
    if (command === 'sil') {
        commandFound = true;
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ **Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın!**');
        if (!message.guild.members.me.permissions.has('ManageMessages')) return message.reply('❌ **Bu komutu kullanabilmem için `Mesajları Yönet` yetkisine sahip olmalıyım!**');
        const allowedIDs = ['1384142034884886731', '1200687946827837453'];
        if (!allowedIDs.includes(message.author.id)) return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 1000) return message.reply('❌ **Lütfen 1 ile 1000 arasında bir sayı gir!**');
        await message.delete().catch(() => {});
        try {
            const target = message.mentions.users.first();
            let deleted;
            if (target) {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const filtered = messages.filter(m => m.author.id === target.id).first(amount);
                deleted = await message.channel.bulkDelete(filtered, false);
            } else {
                deleted = await message.channel.bulkDelete(amount, false);
            }
            const embed = new EmbedBuilder()
                .setTitle('Mesaj Silindi')
                .setDescription(`> <@${message.author.id}> Tarafından, \`${deleted.size}\` Mesaj Silindi.`)
                .setTimestamp();
            const msg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => msg.delete().catch(() => {}), 4000);
        } catch (error) {
            return message.reply('❌ **Hata:** Silmeye çalıştığın mesajların arasında 14 günden eski mesajlar var!');
        }
    }

    // ---- C!zar ----
    if (command === 'zar') {
        commandFound = true;
        const initialEmbed = new EmbedBuilder()
            .setAuthor({ name: '𝐬𝐚𝐧𝐬 𝐳𝐚𝐫𝐢', iconURL: message.author.displayAvatarURL() })
            .setDescription('୭˚.ᵎᵎ┆𝐳𝐚𝐫𝐢 𝐚𝐭𝐢𝐲𝐨𝐫𝐮𝐦...')
            .setColor(0xffffff)
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();
        const msg = await message.reply({ embeds: [initialEmbed] });
        setTimeout(async () => {
            const result = Math.floor(Math.random() * 25) + 1;
            const editedEmbed = new EmbedBuilder()
                .setAuthor({ name: '𝐬𝐚𝐧𝐬 𝐳𝐚𝐫𝐢', iconURL: message.author.displayAvatarURL() })
                .setDescription(`🎲𝐬𝐞𝐬𝐥𝐞𝐫 𝐲𝐮𝐤𝐬𝐞𝐥𝐝𝐢 𝐬𝐚𝐲𝐢𝐦 **${result}**`)
                .setColor(0xffffff)
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();
            await msg.edit({ embeds: [editedEmbed] }).catch(() => {});
        }, 3000);
    }

    // ---- C!karne ----
    if (command === 'karne') {
        commandFound = true;
        const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const embed = new EmbedBuilder()
            .setTitle(`${message.author.toString()} İşte Karne Notların!`)
            .setColor(0x0a0a0a)
            .setDescription(`
│**Matematik** : ${getRandom(0, 100)}
│**Türkçe** : ${getRandom(0, 100)}
│**İngilizce** : ${getRandom(0, 100)}
│**Beden Eğitimi** : ${getRandom(0, 100)}
│**Almanca** : ${getRandom(0, 100)}
│**Sosyal Bilgiler** : ${getRandom(0, 100)}
│**İnkılap Tarihi Ve Atatürkçülük** : ${getRandom(0, 100)}
│**Coğrafya** : ${getRandom(0, 100)}
│**Türk Tarihi ve Edebiyat** : ${getRandom(0, 100)}
│**Görsel sanatlar/Müzik** : ${getRandom(0, 100)}
│**Bioloji** : ${getRandom(0, 100)}
│**Kimya** : ${getRandom(0, 100)}`);
        return message.reply({ embeds: [embed] });
    }

    // ---- C!iq ----
    if (command === 'iq') {
        commandFound = true;
        const initialEmbed = new EmbedBuilder()
            .setTitle('🧠𝐈𝐪 𝐨𝐥𝐜𝐮𝐥𝐮𝐲𝐨𝐫...')
            .setColor(0xff84b4);
        const msg = await message.reply({ embeds: [initialEmbed] });
        setTimeout(async () => {
            const iqResult = Math.floor(Math.random() * 199) + 1;
            const finalEmbed = new EmbedBuilder()
                .setTitle('𝐈𝐪\'𝐮𝐧𝐮 𝐎𝐥𝐜𝐭𝐮𝐦 𝐕𝐞 𝐄𝐥𝐢𝐦𝐞 𝐁𝐮 𝐕𝐞𝐫𝐢𝐥𝐞𝐫 𝐆𝐞𝐥𝐝𝐢!')
                .setDescription(`𝐈𝐪 𝐒𝐞𝐯𝐢𝐲𝐞𝐧: **${iqResult}**`)
                .setFooter({ text: message.member.displayName })
                .setColor(0xff84b4);
            await msg.edit({ embeds: [finalEmbed] }).catch(() => {});
        }, 3000);
    }

    // ---- C!lock / C!unlock ----
    if (['lock', 'unlock', 'kilitle', 'ac'].includes(command)) {
        commandFound = true;
        if (!message.member.permissions.has('ManageChannels')) return message.reply(`❌ Bu komutu kullanmak için \`Kanalları Yönet\` yetkisine sahip olmalısın.\n<@${message.author.id}>`);
        const isLock = ['lock', 'kilitle'].includes(command);
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: !isLock });
        const embed = new EmbedBuilder()
            .setColor(0x0a0a0a)
            .setTitle(isLock ? `✅ Kanal Başarılı Şekilde Kilitlendi!` : `✅ Kanal Başarılı Şekilde Kilidi Açıldı!`)
            .setDescription(isLock ? 'Kanalın kilidini açmak için aşağıdaki butona bas veya `C!unlock` yaz.' : 'Tekrar kilitlemek için alttaki butona veya `C!lock` yazın.');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(isLock ? 'unlock' : 'lock')
                .setLabel(isLock ? 'UnLock\'la' : 'Lock\'la')
                .setStyle(isLock ? ButtonStyle.Success : ButtonStyle.Danger)
                .setEmoji(isLock ? '🔓' : '🔒')
        );
        await message.reply({ embeds: [embed], components: [row] });
    }

    // ---- C!çamlıcakulesi ----
    if (command === 'çamlıcakulesi' || command === 'camlicakulesi') {
        commandFound = true;
        await message.delete().catch(() => {});
        const embed = new EmbedBuilder()
            .setTitle('𝐂𝐀𝐌𝐋𝐈𝐂𝐀 𝐊𝐔𝐋𝐄𝐒𝐈!🗼🇹🇷')
            .setImage('https://cdn.discordapp.com/attachments/1260175759960576041/1416365480670793788/4884cfa5b44ae4fead521e635ae4305f.jpg?ex=68c694a5&is=68c54325&hm=5fd552a56e31e9240f7bb6a8f608aab294af83ba9f950b0f3b67cb83a414d256&')
            .setColor(0x000000);
        return message.channel.send({ embeds: [embed] });
    }

    // ---- C!onemli ----
    if (command === 'onemli') {
        commandFound = true;
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        await message.delete().catch(() => {});
        message.channel.send({
            content: `ACİL DUYURU
Bu uyarıyı aldık ve herkes dikkatli olsun diye paylaşıyoruz. Lütfen dikkatlice okuyun. Bu çok önemli olduğu için katıldığınız tüm sunuculara gönderin.
“PEDRO”, “PEDROSOY” veya “CIRILOJR” adlı kişilerden gelen arkadaşlık isteklerini kabul etmeyin. Profil fotoğrafı eski siyah-beyaz bir asker fotoğrafıdır.
Bu kişi bir hacker / siber avcıdır. Arkadaş listenizdeki herkese söyleyin, çünkü eğer listenizdeki biri onu eklerse, o kişi sizin listenizde de görünür.
IP adresinizi ve bilgisayar adresinizi bulacaklar, bu yüzden bu mesajı mümkün olan her yerde kopyalayıp yapıştırın.
Rastgele Discord kullanıcılarına arkadaşlık isteği gönderiyor ve kabul edenlerin hesapları ile IP adresleri açığa çıkıyor.
Bu bilgiyi paylaşın ve katıldığınız her Discord sunucusuna gönderin.
Eğer bu kullanıcıyı görürseniz, ARKADAŞLIK İSTEĞİNİ KABUL ETMEYİN ve hemen rapor edin!
Discord arkadaşlık istekleriniz konusunda dikkatli olun.
Lütfen bu mesajı başka bir sunucuya kopyalayıp yapıştırarak diğer insanları da bilgilendirin.

@everyone & @here`,
            allowedMentions: { parse: ['everyone', 'roles', 'users'] }
        });
    }

    // ---- C!hava ----
    if (command === 'hava') {
        commandFound = true;
        if (args.length === 0) return message.reply('❌ **Lütfen şehir adını giriniz!**');
        await message.delete().catch(() => {});
        const city = args.join(' ');
        const embed = new EmbedBuilder()
            .setTitle(`${city} 🌧️`)
            .setDescription('***Hava*** :white_sun_cloud:\n***Durumu*** :sunny:')
            .setImage(`https://wttr.in/${encodeURIComponent(city)}.png`)
            .setFooter({ text: message.author.username })
            .setTimestamp()
            .setColor(0x0099ff);
        return message.channel.send({ embeds: [embed] });
    }

    // ---- C!ship ----
    if (command === 'ship') {
        commandFound = true;
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ **Birini Etiketlemelisin!**');
        const percentage = Math.floor(Math.random() * 101);
        const randomColor = Math.floor(Math.random() * 16777215);
        const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} Shipledi`)
            .setColor(randomColor)
            .setDescription(`${message.author.toString()} <@${target.id}>\n\n**%${percentage} Seviyor Seni**`)
            .setFooter({ text: `${message.member.nickname || message.author.username} Kullandı.`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        const msg = await message.reply({ embeds: [embed] });
        await msg.react('❤️').catch(() => {});
        await msg.react('💔').catch(() => {});
    }

    // ---- C!bakim-ac / C!bakim-kapat ----
    if (command === 'bakim-ac') {
        commandFound = true;
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        isMaintenance = true;
        return message.reply('✅・Başarıyla Bakım Modu Açılmıştır!');
    }

    if (command === 'bakim-kapat') {
        commandFound = true;
        if (message.author.id !== '1200687946827837453') return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        isMaintenance = false;
        await message.delete().catch(() => {});
        return message.channel.send('✅・Başarıyla Bakım Modu Kapatılmıştır!');
    }

    // ---- C!random ----
    if (command === 'random') {
        commandFound = true;
        const allowedIDs = ['1384142034884886731', '1200687946827837453'];
        if (!allowedIDs.includes(message.author.id)) return message.reply(`𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?\n<@${message.author.id}>`);
        const msg = await message.reply('Random Kişi Seçiliyor...');
        setTimeout(async () => {
            const randomMember = message.guild.members.cache.random();
            await msg.edit(`Random Kişi Seçildi **${randomMember.user.username}**`).catch(() => {});
        }, 5000);
    }

    // ---- EKONOMI KOMUTLARI ----
    if (command === 'bal') {
        commandFound = true;
        let d = getDB();
        const bal = d[message.author.id]?.balance || 0;
        message.reply(`💵 Bakiyen: **${bal} OwO Coin**`);
    }

    if (command === 'cf') {
        commandFound = true;
        const bet = parseInt(args[0]);
        if (!bet || bet < 1) return message.reply('❌ Geçerli bir miktar gir!');
        let d = getDB();
        if (!d[message.author.id]) d[message.author.id] = { balance: 0, lastDaily: 0, xp: 0, level: 1 };
        let userBal = d[message.author.id].balance || 0;
        if (userBal < bet) return message.reply('❌ Yetersiz bakiye!');
        const win = Math.random() > 0.5;
        if (win) { userBal += bet; message.reply(`✅ Kazandın! Yeni bakiyen: **${userBal}**`); }
        else { userBal -= bet; message.reply(`❌ Kaybettin! Yeni bakiyen: **${userBal}**`); }
        d[message.author.id].balance = userBal;
        saveDB(d);
    }

    if (command === 's') {
        commandFound = true;
        const reward = Math.floor(Math.random() * 50) + 10;
        let d = getDB();
        if (!d[message.author.id]) d[message.author.id] = { balance: 0, lastDaily: 0, xp: 0, level: 1 };
        d[message.author.id].balance = (d[message.author.id].balance || 0) + reward;
        saveDB(d);
        message.reply(`🏹 Avlandın ve **${reward}** Coin kazandın! Toplam: **${d[message.author.id].balance}**`);
    }

    if (command === 'daily') {
        commandFound = true;
        let d = getDB();
        if (!d[message.author.id]) d[message.author.id] = { balance: 0, lastDaily: 0, xp: 0, level: 1 };
        const now = Date.now();
        const cooldown = 86400000;
        const lastDaily = d[message.author.id].lastDaily || 0;
        if (now - lastDaily < cooldown) {
            const remaining = cooldown - (now - lastDaily);
            const hours = Math.floor(remaining / 3600000);
            const mins = Math.floor((remaining % 3600000) / 60000);
            return message.reply(`⏳ Günlük ödülünü zaten almışsın! **${hours} saat ${mins} dakika** bekle.`);
        }
        d[message.author.id].balance = (d[message.author.id].balance || 0) + 500;
        d[message.author.id].lastDaily = now;
        saveDB(d);
        message.reply(`🎁 Günlük ödülün olan **500 OwO Coin** hesabına eklendi!`);
    }

    // ---- C!seviye / C!rank ----
    if (['seviye', 'rank'].includes(command)) {
        commandFound = true;
        let d = getDB();
        const user = message.mentions.users.first() || message.author;
        const userData = d[user.id] || { xp: 0, level: 1 };
        const embed = new EmbedBuilder()
            .setTitle(`${user.username} - Seviye Bilgisi`)
            .setDescription(`**Seviye:** ${userData.level}\n**XP:** ${userData.xp} / ${userData.level * 100}`)
            .setColor(0x0099ff)
            .setThumbnail(user.displayAvatarURL());
        return message.reply({ embeds: [embed] });
    }

    // ---- C!rolver / C!rolal ----
    if (['rolver', 'rolal'].includes(command)) {
        commandFound = true;
        if (!message.member.permissions.has('ManageRoles')) return message.reply(`❌ \`Rolleri Yönet\` iznin yok!`);
        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();
        if (!member) return message.reply('❌ Birini etiketle!');
        if (!role) return message.reply('❌ Bir rol etiketle!');
        if (member.id === message.guild.ownerId) return message.reply('❌ Sunucu sahibine işlem yapamam.');
        await message.delete().catch(() => {});
        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                message.channel.send(`**${member.user.username}**'dan <@&${role.id}> rolü alındı!`);
            } else {
                await member.roles.add(role);
                message.channel.send(`**${member.user.username}**'a <@&${role.id}> rolü verildi!`);
            }
        } catch { message.reply('❌ Rol işlemi başarısız!'); }
    }

    // ---- C!sunucubilgi / C!sb ----
    if (['sunucubilgi', 'sb'].includes(command)) {
        commandFound = true;
        if (isMaintenance) return message.reply('❌ Bakımdayız!');
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Sunucusu Hakkında Bilgiler`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x0099ff)
            .setDescription(`
**»** 👑 Kurucu: <@${guild.ownerId}>
**»** 🚪 Kurulma: ${guild.createdAt.toLocaleDateString('tr-TR')}
**»** 👥 Üye: ${guild.memberCount}
**»** 📂 Kanal: ${guild.channels.cache.size}
**»** 🏷️ Rol: ${guild.roles.cache.size}
**»** 🚀 Boost: ${guild.premiumSubscriptionCount || 0}
**»** 👑 En Yüksek Rol: <@&${guild.roles.highest.id}>`)
            .setFooter({ text: 'CeyCey' })
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    // ---- C!deprem ----
    if (command === 'deprem') {
        commandFound = true;
        try {
            const res = await axios.get('https://api.astra-dev.com.tr/api/deprem');
            const data = res.data;
            const embed = new EmbedBuilder()
                .setTitle('Güncel Deprem Verileri')
                .setColor(0xffffff)
                .setAuthor({ name: 'Güncel Deprem Verileri', iconURL: message.guild.iconURL() || undefined })
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() || undefined });
            for (let i = 0; i < Math.min(data.length, 4); i++) {
                const eq = data[i];
                embed.addFields({ name: `Deprem ${i + 1}`, value: `**Yer:** *${eq.yer}*\n**Tarih:** *${eq.tarih}*\n**Büyüklük:** *${eq.buyukluk}*\n**Enlem:** *${eq.enlem}*\n**Boylam:** *${eq.boylam}*` });
            }
            return message.reply({ embeds: [embed] });
        } catch { message.reply('❌ Deprem verisi alınamadı!'); }
    }

    // ---- C!anket ----
    if (command === 'anket') {
        commandFound = true;
        const bypassRole = message.member.roles.cache.find(r => r.name === 'Mekanın sahibi👑');
        const isAuthorized = message.author.id === '1200687946827837453' || bypassRole || message.member.permissions.has('ManageMessages');
        if (!isAuthorized) return message.reply('𝐁𝐮 𝐤𝐨𝐦𝐮𝐭𝐮 𝐤𝐮𝐥𝐥𝐚𝐧𝐚 𝐛𝐢𝐥𝐞𝐜𝐞𝐠𝐢𝐧𝐢𝐦𝐢 𝐬𝐚𝐧𝐝𝐢𝐧?');
        const targetChannel = message.mentions.channels.first();
        let desc = ':bar_chart: Bu kurulum, anketi özel ihtiyaçlarınıza ve tercihlerinize göre uyarlamanızı sağlar.';
        if (targetChannel) desc = `:bar_chart: Anket ayarlarınız artık başarıyla seçtiğiniz <#${targetChannel.id}> için kanal kimliğini içeriyor.`;
        const embed = new EmbedBuilder()
            .setTitle('Anket kurulumu')
            .setColor(0x5865f2)
            .setDescription(`> ${desc}`)
            .addFields(
                { name: 'Ayarlar', value: 'Oylama seçenekleri, başlık ve açıklama dahil olmak üzere anketinizin çeşitli yönlerini özelleştirmek için **Ayarlar** paneline erişin.' },
                { name: 'Anketi yolla', value: 'Kurulumunuzu tamamladıktan sonra anket, oylama sürecini başlatmak için **Anketi Gönder** düğmesine basın.' }
            );
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`poll_settings-${message.author.id}`).setLabel('Ayarlar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`poll_send-${message.author.id}`).setLabel('Anketi yolla').setStyle(ButtonStyle.Success)
        );
        return message.reply({ embeds: [embed], components: [row] });
    }

    // ---- C!giris-cikis ----
    if (command === 'giris-cikis') {
        commandFound = true;
        if (!message.member.permissions.has('ManageGuild')) return message.reply('❌ Yetkin yok!');
        const embed = new EmbedBuilder()
            .setTitle('Giriş-Çıkış Kurulum Paneli')
            .setDescription('Aşağıdaki butonları kullanarak sistemi özelleştir.')
            .setColor(0x0099ff);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('set_join_msg').setLabel('Giriş Mesajı').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('set_leave_msg').setLabel('Çıkış Mesajı').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('set_channels').setLabel('Kanal Seç').setStyle(ButtonStyle.Secondary)
        );
        await message.reply({ embeds: [embed], components: [row] });
    }

    // ---- HATA MESAJI ----
    if (!commandFound) {
        const errorEmbed = new EmbedBuilder()
            .setDescription('│ !! 𝐋𝐮𝐭𝐟𝐞𝐧 𝐁𝐨𝐭𝐮𝐧 𝐆𝐞𝐜𝐞𝐫𝐥𝐢 𝐎𝐥𝐝𝐮𝐆𝐮 𝐊𝐨𝐦𝐮𝐭𝐥𝐚𝐫𝐝𝐚𝐧 𝐆𝐢𝐫𝐢𝐧! 𝐲𝐚𝐝𝐚 𝐊𝐨𝐦𝐮𝐭 𝐒𝐢𝐥𝐢𝐧𝐦𝐢𝐬𝐝𝐢𝐫 !! ⚙️ │')
            .setColor(0xff2a2a)
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp();
        return message.reply({ embeds: [errorEmbed] });
    }
});

// ===== ETKILESIM YONETICISI (Butonlar, Modal'lar, Menuler) =====
client.on('interactionCreate', async (interaction) => {
    // SADECE BUTON
    if (interaction.isButton()) {
        const customId = interaction.customId;

        // LOCK/UNLOCK
        if (['lock', 'unlock'].includes(customId)) {
            if (!interaction.member.permissions.has('ManageChannels')) return interaction.reply({ content: '❌ Yetkin yok!', flags: 64 });
            const isUnlock = customId === 'unlock';
            await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: isUnlock });
            return interaction.update({
                embeds: [new EmbedBuilder()
                    .setTitle(isUnlock ? '✅ Kanal Başarılı Şekilde Kilidi Açıldı!' : '✅ Kanal Başarılı Şekilde Kilitlendi!')
                    .setDescription(isUnlock ? 'Tekrar kilitlemek için alttaki butona veya `C!lock` yazın.' : 'Kanalın kilidini açmak için aşağıdaki butona bas veya `C!unlock` yaz.')
                    .setColor(0x0a0a0a)],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(isUnlock ? 'lock' : 'unlock').setLabel(isUnlock ? 'Lock\'la' : 'UnLock\'la').setStyle(isUnlock ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(isUnlock ? '🔒' : '🔓')
                )]
            });
        }

        // ANKET
        if (customId.startsWith('poll_settings-')) {
            if (interaction.user.id !== customId.split('-')[1]) return interaction.reply({ content: 'Bu senin anketin değil!', flags: 64 });
            const modal = new ModalBuilder().setCustomId('poll_modal').setTitle('Anket Ayarları');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Başlık').setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Açıklama').setStyle(TextInputStyle.Paragraph)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('options').setLabel('Seçenekler (Alt alta)').setStyle(TextInputStyle.Paragraph))
            );
            return interaction.showModal(modal);
        }
        if (customId.startsWith('poll_send-')) {
            if (interaction.user.id !== customId.split('-')[1]) return interaction.reply({ content: 'Bu senin anketin değil!', flags: 64 });
            return interaction.reply({ content: '❌ Önce Ayarlar butonundan anketini yapılandır!', flags: 64 });
        }

        // GIRIS-CIKIS
        if (customId === 'set_join_msg' || customId === 'set_leave_msg') {
            const modal = new ModalBuilder()
                .setCustomId(customId === 'set_join_msg' ? 'modal_join' : 'modal_leave')
                .setTitle('Mesajı Özelleştir');
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('msg_input').setLabel('Mesaj ({user} kullan)').setStyle(TextInputStyle.Paragraph).setValue(customId === 'set_join_msg' ? '👋 {user} sunucuya hoş geldin!' : '😢 {user} aramızdan ayrıldı.')
            ));
            return interaction.showModal(modal);
        }
        if (customId === 'set_channels') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('set_join_channel').setLabel('Giriş Kanalı').setStyle(ButtonStyle.Success).setEmoji('👋'),
                new ButtonBuilder().setCustomId('set_leave_channel').setLabel('Çıkış Kanalı').setStyle(ButtonStyle.Danger).setEmoji('😢')
            );
            return interaction.reply({ content: 'Hangi kanalı ayarlamak istersin?', components: [row], flags: 64 });
        }
        if (customId === 'set_join_channel' || customId === 'set_leave_channel') {
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId(customId)
                    .setPlaceholder('Kanal seç...')
                    .setChannelTypes(ChannelType.GuildText)
            );
            return interaction.reply({ content: customId === 'set_join_channel' ? 'Giriş kanalını seç:' : 'Çıkış kanalını seç:', components: [row], flags: 64 });
        }
    }

    // MODAL
    if (interaction.isModalSubmit()) {
        const customId = interaction.customId;
        const msg = interaction.fields.getTextInputValue('msg_input');

        // ANKET MODAL
        if (customId === 'poll_modal') {
            const title = interaction.fields.getTextInputValue('title') || 'Başlıksız Anket';
            const description = interaction.fields.getTextInputValue('description') || 'Açıklama yok';
            const options = interaction.fields.getTextInputValue('options').split('\n').filter(o => o.trim());
            if (options.length < 2) return interaction.reply({ content: 'En az 2 seçenek gerekli!', flags: 64 });
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(0x5865f2)
                .addFields({ name: 'Seçenekler', value: options.map((o, i) => `${i + 1}. ${o}`).join('\n') });
            await interaction.reply({ content: '✅ Anket hazır!', flags: 64 });
            const pollMsg = await interaction.channel.send({ embeds: [embed] });
            for (let i = 0; i < options.length; i++) {
                const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
                if (emojis[i]) await pollMsg.react(emojis[i]).catch(() => {});
            }
            return;
        }

        // GIRIS-CIKIS MODAL
        let d = getDB();
        if (!d.guilds) d.guilds = {};
        if (!d.guilds[interaction.guild.id]) d.guilds[interaction.guild.id] = { joinChannel: null, leaveChannel: null, joinMsg: '👋 {user} sunucuya hoş geldin!', leaveMsg: '😢 {user} aramızdan ayrıldı.' };
        if (customId === 'modal_join') d.guilds[interaction.guild.id].joinMsg = msg;
        if (customId === 'modal_leave') d.guilds[interaction.guild.id].leaveMsg = msg;
        saveDB(d);
        return interaction.reply({ content: '✅ Mesaj kaydedildi!', flags: 64 });
    }

    // KANAL SECIM MENUSU
    if (interaction.isStringSelectMenu()) {
        const channelId = interaction.values[0];
        let d = getDB();
        if (!d.guilds) d.guilds = {};
        if (!d.guilds[interaction.guild.id]) d.guilds[interaction.guild.id] = { joinChannel: null, leaveChannel: null, joinMsg: '👋 {user} sunucuya hoş geldin!', leaveMsg: '😢 {user} aramızdan ayrıldı.' };
        if (interaction.customId === 'set_join_channel') d.guilds[interaction.guild.id].joinChannel = channelId;
        if (interaction.customId === 'set_leave_channel') d.guilds[interaction.guild.id].leaveChannel = channelId;
        saveDB(d);
        return interaction.reply({ content: `✅ ${interaction.customId === 'set_join_channel' ? 'Giriş' : 'Çıkış'} kanalı <#${channelId}> olarak ayarlandı!`, flags: 64 });
    }
});

// ===== GIRIS-CIKIS OTOMATIK MESAJLAR =====
client.on('guildMemberAdd', async member => {
    const data = getGuildData(member.guild.id);
    if (!data.joinChannel) return;
    const channel = member.guild.channels.cache.get(data.joinChannel);
    if (!channel) return;
    const msg = (data.joinMsg || '👋 {user} sunucuya hoş geldin!').replace(/{user}/g, `${member}`);
    const embed = new EmbedBuilder().setTitle('👋 Hoş Geldin!').setDescription(msg).setColor(0x00ff00);
    channel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', async member => {
    const data = getGuildData(member.guild.id);
    if (!data.leaveChannel) return;
    const channel = member.guild.channels.cache.get(data.leaveChannel);
    if (!channel) return;
    const msg = (data.leaveMsg || '😢 {user} aramızdan ayrıldı.').replace(/{user}/g, member.user.username);
    const embed = new EmbedBuilder().setTitle('😢 Görüşürüz!').setDescription(msg).setColor(0xff0000);
    channel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);

// ===== RENDER.COM HEALTH CHECK (Web sunucu) =====
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('CeyCeyBot V2 çalışıyor!');
}).listen(PORT, () => console.log(`Health check sunucusu port ${PORT}'de çalışıyor`));
