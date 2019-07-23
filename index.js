const AWS = require("aws-sdk");
const co = require("await-to-js").default;

class Auth {
	UserPoolId = null;
	cognitoClient = null;
	user = null;
	groups = null;

	constructor(Region, UserPoolId) {
		this.cognitoClient = new AWS.CognitoIdentityServiceProvider({
			region: process.env.REGION
		});
		this.UserPoolId = UserPoolId
	}

	get Username() {
		return this.user.Username;
	}

	async getUserInfo(sub) {
		let err

		const request = {
			UserPoolId,
			Filter: `sub = "${sub}"`,
			Limit: 1
		};
		[err, data] = await co(cognitoClient.listUsers(request).promise());
		if (err) {
			return [err];
		}

		this.user = data.Users[0]
		return [err,this.user];
	}

	async isAdmin(sub) {
		let err
		if (!user) {
			[err] = await getUserInfo(sub)
		}

		[err] = await getGroup()

		if (err) {
			return [err]
		}

		if (!this.groups.filter(e => e.GroupName === 'admin')) {
			return [err, false]
		} else {
			return [err, true]
		}
	}

	// common functions
	async getGroup() {
		let err;

		const Username = this.user.Username;

		[err, data] = await co(cognitoClient.adminListGroupsForUser({
			this.UserPoolId,
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