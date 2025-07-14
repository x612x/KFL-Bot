const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  PermissionsBitField, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  Events 
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

const prefix = process.env.prefix || '+';

// إعدادات السيرفر والرومات
const guildId = '1385342015771902053'; // ايدي السيرفر
const welcomeChannelId = '1385344850798448670'; // روم الترحيب
const voiceChannelId = '1385342017781104794'; // روم الصوتي
const logChannelId = '1394207295097012264'; // روم اللوق

// رومات ترد بصورة محددة (كملف)
const imageReplyChannels = [
  '1385345315636379829',
  '1385345229049036820',
  '1385346474119794828',
  '1385347548012609597',
  '1385348335958757437',
  '1385348536098361374',
  '1385349507436384486',
  '1385350397866283078',
  '1385350536601272430',
  '1385350870111092836',
  '1385351790333133011',
  '1393114996853968917',
  '1385351953546215595',
  '1385352289761366057',
  '1385352411388051536',
  '1385352642821226618',
  '1385354758201671773',
  '1385355180437930215',
  '1385355423116431461',
  '1385356230393860106',
  '1385356403077812426',
];

// صورة الرد التلقائي بدون إطار كملف
const autoReplyImageUrl = 'https://media.discordapp.net/attachments/1385345315636379829/1393178182462476308/60_20250711111527.webp?ex=6875858a&is=6874340a&hm=9e55aae3374a91a951ec52c8d3c34c8bf56301e9a7eedb9d1f410ee33c38909d&=&format=webp&width=972&height=64';

client.once('ready', async () => {
  console.log('بوت KFL STORE جاهز ✅');
  client.user.setActivity(`KFL STORE | ${prefix}help`, { type: 'WATCHING' });

  try {
    const guild = await client.guilds.fetch(guildId);
    const voiceChannel = guild.channels.cache.get(voiceChannelId);
    if (!voiceChannel || voiceChannel.type !== 2) { // 2 = Voice Channel
      console.log('الروم الصوتي غير موجود أو مش صوتي.');
      return;
    }

    joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: guildId,
      adapterCreator: guild.voiceAdapterCreator,
    });
    console.log('تم دخول الروم الصوتي.');
  } catch (error) {
    console.error('خطأ بالدخول للروم الصوتي:', error);
  }
});

// ترحيب عند دخول عضو جديد
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor('#00ffcc')
    .setTitle(`👋 مرحباً بك في السيرفر، ${member.user.username}!`)
    .setDescription(`نورت السيرفر يا <@${member.id}> ✨\nنتمنى لك وقت ممتع معنا.`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: 'KFL STORE', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();
  channel.send({ embeds: [embed] });
});

// مراقبة الرسائل للرد التلقائي في الرومات المحددة
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // رد تلقائي بالصورة كملف في الرومات المحددة إذا الرسالة مو أمر
  if (imageReplyChannels.includes(message.channel.id)) {
    if (!message.content.startsWith(prefix)) {
      return message.channel.send({ files: [autoReplyImageUrl] });
    }
  }

  // فقط أوامر تبدأ بالبريفكس وتكون في سيرفر
  if (!message.guild) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // أوامر البوت:

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#00ccff')
      .setTitle('📜 اختر نوع الأوامر من القائمة')
      .setDescription('اختر من القائمة أدناه لتشاهد الأوامر.');

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('اختر نوع الأوامر')
      .addOptions([
        { label: 'الأوامر العامة', description: 'عرض الأوامر العامة', value: 'general' },
        { label: 'أوامر الإدارة', description: 'عرض أوامر الإدارة', value: 'admin' },
        { label: 'أوامر البث', description: 'عرض أوامر البث', value: 'broadcast' },
        { label: 'الروابط', description: 'عرض روابط الدعم', value: 'links' },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await message.channel.send({ embeds: [embed], components: [row] });
  }

  else if (command === 'ping') {
    const msg = await message.channel.send('جارٍ القياس...');
    const latency = msg.createdTimestamp - message.createdTimestamp;
    return msg.edit(`📶 سرعة الاتصال: ${latency}ms\n📡 سرعة API: ${Math.round(client.ws.ping)}ms`);
  }

  else if (command === 'userinfo') {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setColor('#a4c8fd')
      .setTitle('معلومات المستخدم')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(`👤 الاسم: ${user.username}\n🆔 الايدي: ${user.id}\n📅 الحساب منذ: <t:${Math.floor(user.createdTimestamp / 1000)}:R>`);
    return message.channel.send({ embeds: [embed] });
  }

  else if (command === 'serverinfo') {
    const guild = message.guild;
    const embed = new EmbedBuilder()
      .setColor('#8ee4af')
      .setTitle('معلومات السيرفر')
      .setThumbnail(guild.iconURL())
      .setDescription(`📛 اسم السيرفر: ${guild.name}\n🆔 الايدي: ${guild.id}\n👑 مالك السيرفر: <@${guild.ownerId}>\n👥 عدد الأعضاء: ${guild.memberCount}\n📅 تأسس في: <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`);
    return message.channel.send({ embeds: [embed] });
  }

  else if (command === 'avatar') {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ صورة ${user.username}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('#0099ff');
    return message.channel.send({ embeds: [embed] });
  }

  else if (command === 'say') {
    const text = args.join(' ');
    if (!text) return message.reply('اكتب شي يالبى.');
    message.delete().catch(() => {});
    return message.channel.send(text);
  }

  else if (command === 'sayimage') {
    const imageUrl = args[0];
    if (!imageUrl) return message.reply('حط رابط الصورة.');
    if (!imageUrl.startsWith('http')) return message.reply('رابط الصورة غير صحيح.');
    message.delete().catch(() => {});
    // إرسال الصورة كملف بدون إطار
    return message.channel.send({ files: [imageUrl] });
  }

  else if (command === 'showavatar') {
    const user = message.mentions.users.first();
    if (!user) return message.reply('منشن شخص عشان أشوف صورته.');
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ صورة ${user.username}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor('#00ccff');
    return message.channel.send({ embeds: [embed] });
  }

  else if (command === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply('ما عندك صلاحية إدارة الرسائل ❌');
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100)
      return message.reply('اكتب رقم بين 1 و 100.');
    await message.channel.bulkDelete(amount, true).catch(() => {});
    return message.channel.send(`تم حذف ${amount} رسالة ✅`).then(m => setTimeout(() => m.delete(), 3000));
  }

  else if (command === 'support') {
    return message.reply('رابط الدعم الفني: https://discord.gg/lik');
  }

  else if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('ما عندك صلاحية حظر الأعضاء ❌');
    const user = message.mentions.members.first();
    if (!user) return message.reply('منشن العضو اللي تبي تحظره.');
    if (!user.bannable) return message.reply('ما أقدر أحظر هذا العضو.');
    const reason = args.slice(1).join(' ') || 'بدون سبب';
    await user.ban({ reason });
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🚫 تم حظر عضو')
        .setDescription(`**العضو:** ${user.user.tag} (${user.id})\n**بواسطة:** ${message.author.tag}\n**السبب:** ${reason}`)
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
    return message.channel.send(`تم حظر العضو ${user.user.tag} بسبب: ${reason}`);
  }

  else if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply('ما عندك صلاحية طرد الأعضاء ❌');
    const user = message.mentions.members.first();
    if (!user) return message.reply('منشن العضو اللي تبي تطرده.');
    if (!user.kickable) return message.reply('ما أقدر أطرد هذا العضو.');
    const reason = args.slice(1).join(' ') || 'بدون سبب';
    await user.kick(reason);
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('👢 تم طرد عضو')
        .setDescription(`**الالعضو:** ${user.user.tag} (${user.id})\n**بواسطة:** ${message.author.tag}\n**السبب:** ${reason}`)
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
    return message.channel.send(`تم طرد العضو ${user.user.tag} بسبب: ${reason}`);
  }

  else if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('ما عندك صلاحية كتم الأعضاء ❌');
    const user = message.mentions.members.first();
    if (!user) return message.reply('منشن العضو اللي تبي تكتمه.');
    const muteRole = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) return message.reply('ما لقيت رتبة Muted في السيرفر.');
    await user.roles.add(muteRole);
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('🔇 تم كتم عضو')
        .setDescription(`**العضو:** ${user.user.tag} (${user.id})\n**بواسطة:** ${message.author.tag}`)
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
    return message.channel.send(`تم كتم ${user.user.tag} بنجاح.`);
  }

  else if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('ما عندك صلاحية فك الكتم ❌');
    const user = message.mentions.members.first();
    if (!user) return message.reply('منشن العضو اللي تبي تفك كتمه.');
    const muteRole = message.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) return message.reply('ما لقيت رتبة Muted في السيرفر.');
    await user.roles.remove(muteRole);
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor('#55ff55')
        .setTitle('🔈 تم فك كتم عضو')
        .setDescription(`**العضو:** ${user.user.tag} (${user.id})\n**بواسطة:** ${message.author.tag}`)
        .setTimestamp();
      logChannel.send({ embeds: [logEmbed] });
    }
    return message.channel.send(`تم فك الكتم عن ${user.user.tag} بنجاح.`);
  }

  else if (command === 'lock') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply('ما عندك صلاحية إدارة الرومات ❌');
    const channel = message.channel;
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    return message.channel.send('تم قفل الروم الحالي.');
  }

  else if (command === 'unlock') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return message.reply('ما عندك صلاحية إدارة الرومات ❌');
    const channel = message.channel;
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
    return message.channel.send('تم فتح الروم الحالي.');
  }

  // أوامر البث
  else if (['bc', 'obc', 'fbc'].includes(command)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply('ما عندك صلاحية استخدام أمر البث ❌');
    if (!args.length)
      return message.reply('اكتب الرسالة اللي تبي تبعثها.');

    const members = await message.guild.members.fetch();
    let targetMembers;

    if (command === 'bc') {
      targetMembers = members.filter(m => !m.user.bot);
    } else if (command === 'obc') {
      targetMembers = members.filter(m => m.presence && m.presence.status !== 'offline' && !m.user.bot);
    } else if (command === 'fbc') {
      targetMembers = members.filter(m => (!m.presence || m.presence.status === 'offline') && !m.user.bot);
    }

    const broadcastMessage = args.join(' ');

    let sentCount = 0;
    let failedCount = 0;

    const statsMessage = await message.channel.send('⏳ جاري إرسال الرسائل...');

    for (const member of targetMembers.values()) {
      try {
        await member.send(`<@${member.id}> ${broadcastMessage}`);
        sentCount++;
      } catch {
        failedCount++;
      }
    }

    await statsMessage.edit(`✅ تم إرسال الرسائل.\n\nالمرسلة: ${sentCount}\nالفاشلة: ${failedCount}`);

    return message.channel.send('تم الانتهاء من إرسال الرسائل.');
  }
});

// التفاعل مع قائمة الأوامر (Select Menu) في أمر help
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'help_select') {
    let embed;
    switch (interaction.values[0]) {
      case 'general':
        embed = new EmbedBuilder()
          .setColor('#00ccff')
          .setTitle('📋 الأوامر العامة')
          .setDescription(`
\`${prefix}ping\` - سرعة استجابة البوت  
\`${prefix}userinfo\` - معلومات عن المستخدم  
\`${prefix}serverinfo\` - معلومات السيرفر  
\`${prefix}avatar\` - عرض صورتك الشخصية  
\`${prefix}say\` - يكرر كلامك بدون صورة  
\`${prefix}sayimage <رابط>\` - يرسل صورة من الرابط  
\`${prefix}clear <عدد>\` - مسح عدد من الرسائل  
\`${prefix}showavatar @user\` - يعرض صورة شخص منشنته  
\`${prefix}support\` - رابط الدعم الفني
          `);
        break;

      case 'admin':
        embed = new EmbedBuilder()
          .setColor('#ff6600')
          .setTitle('🛠️ أوامر الإدارة')
          .setDescription(`
\`${prefix}ban @user [سبب]\` - حضر عضو  
\`${prefix}kick @user [سبب]\` - طرد عضو  
\`${prefix}mute @user\` - كتم عضو  
\`${prefix}unmute @user\` - فك كتم عضو  
\`${prefix}lock\` - قفل الروم  
\`${prefix}unlock\` - فتح الروم
          `);
        break;

      case 'broadcast':
        embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📢 أوامر البث')
          .setDescription(`
\`${prefix}bc <رسالة>\` - بث لكل الأعضاء  
\`${prefix}obc <رسالة>\` - بث للأونلاين فقط  
\`${prefix}fbc <رسالة>\` - بث للأوفلاين فقط
          `);
        break;

      case 'links':
        embed = new EmbedBuilder()
          .setColor('#00cc66')
          .setTitle('🔗 روابط الدعم')
          .setDescription(`
[دعوة البوت](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)  
[سيرفر الدعم](https://discord.gg/lik)
          `);
        break;
    }
    await interaction.update({ embeds: [embed], components: [] });
  }
});

client.login(process.env.token);
