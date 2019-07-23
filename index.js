const AWS = require("aws-sdk");
const co = require("await-to-js").default;

class Auth {
    constructor(Region, UserPoolId) {
        this.cognitoClient = new AWS.CognitoIdentityServiceProvider({
            region: process.env.REGION
        });
        this.UserPoolId = UserPoolId;
        this.user = null;
        this.groups = null;
    }

    get Username() {
        return this.user.Username;
    }

    async getUserInfo(sub) {
        let err, data;

        const request = {
            UserPoolId: this.UserPoolId,
            Filter: `sub = "${sub}"`,
            Limit: 1
        };
        [err, data] = await co(this.cognitoClient.listUsers(request).promise());
        if (err) {
            return [err];
        }

        this.user = data.Users[0];
        return [err,this.user];
    }

    async isAdmin(sub) {
        let err;
        if (!this.user) {
            [err] = await this.getUserInfo(sub);
        }

        [err] = await this.getGroup();

        if (err) {
            return [err];
        }

        if (!this.groups.filter(function (e) { return e.GroupName === 'admin'})) {
            return [err, false, this.user, this.groups];
        } else {
            return [err, true, this.user, this.groups];
        }
    }

    // common functions
    async getGroup() {
        let err, data;

        const Username = this.user.Username;

        [err, data] = await co(this.cognitoClient.adminListGroupsForUser({
            UserPoolId: this.UserPoolId,
            Username
        }).promise());
        if (err) {
            console.error(err);
            return [err];
        }

        this.groups = data.Groups;
        return [err, this.groups];
    }
}

module.exports = Auth;