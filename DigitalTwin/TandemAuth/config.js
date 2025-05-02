
module.exports = { 
    callbackURL: process.env.BOX_CALLBACK_URL || 'http://localhost:1234/token/forgeoauth',
    credentials: {
      client_id: process.env.BOX_CLIENT_ID || '<your client_id>',
      client_secret: process.env.BOX_CLIENT_SECRET || '<your client_secret>' 
    },
    scope: ["user:read",
"user:write",
"user-profile:read",
"openid",
"data:create",
"data:read",
"data:write",
"data:search",
"bucket:create",
"bucket:read",
"bucket:update",
"bucket:delete",
"code:all",
"account:write",
"account:read",
"viewables:read"] 
};

