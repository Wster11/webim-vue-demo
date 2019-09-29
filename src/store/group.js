import { ftruncate } from "fs";

const Group = {
	state: {
		publicGroupList: [],
		groupNotifications: [],
		groupInfo: {
			gid: "",
			name: "",
			admin: "",
			desc: "",
			membersonly: "",
			members: []
		},
		groupBlack: []
	},
	mutations: {
		updatePublicGroup(state, publicGroup) {
			state.publicGroupList = publicGroup;
		},
		updateGroupNotifications(state, data) {
			console.log("updateGroupNotifications",data)
			state.groupNotifications = data;
		},
		getInfo(state, payload) {
			const { gid, name, admin, desc, membersonly, members } = payload;
			state.groupInfo.gid = gid;
			state.groupInfo.name = name;
			state.groupInfo.admin = admin;
			state.groupInfo.desc = desc;
			state.groupInfo.membersonly = membersonly;
			state.groupInfo.members = members
		},
		updateGroupBlack(state,payload){
			console.log("updateGroupBlack",payload)
			state.groupBlack = payload
		}
	},
	actions: {
		//获取公开群组
		onGetPublicGroup: function (context, payload) {
			debugger
			let limit = 50;
			let options = {
				limit: limit,// 预期每页获取的记录数
				success: function (resp) {
					let publicGroup = resp.data
					// console.log("Response: ", publicGroup);
					// let globalCursor = resp.cursor;
					context.commit("updatePublicGroup", publicGroup)
				},
				error: function (e) {
					console.log("获取群组失败", e)
				}
			};
			WebIM.conn.listGroups(options);
		},
		//获取群组详情
		onGetGroupinfo: function (context, payload) {
			console.log("onGetGroupinfo", payload)
			let gid = payload.groupid;
			let options = {
				groupId: gid,  //群组id
				success: function (resp) {
					console.log("Response: ", resp);
					let name = resp.data[0].name;
					let admin = resp.data[0].owner;
					let desc = resp.data[0].description;
					let membersonly = resp.data[0].membersonly;
					let members = resp.data[0].affiliations;
					context.commit("getInfo", {
						gid,
						name,
						admin,
						desc,
						membersonly,
						members
					})
				},
				error: function () { }
			};
			WebIM.conn.getGroupInfo(options)
		},
		//申请加入群组
		onJoinGroup: function (context, payload) {
			let options = {
				groupId: payload.groupId,                              // 群组ID
				success: function (resp) {
					console.log("Response: ", resp);
				},
				error: function (e) {
					if (e.type == 17) {
						console.log("您已经在这个群组里了");
					}
				}
			};
			WebIM.conn.joinGroup(options);
		},
		//创建群组
		onCreateGroup: function (context, payload) {
			console.log("onCreateGroup", payload)
			const { groupname, desc, members, pub, approval } = payload
			let options = {
				data: {
					groupname: groupname,                    // 群组名
					desc: desc,                          // 群组描述
					members: members,            // 用户名组成的数组
					public: pub,                         // pub等于true时，创建为公开群
					approval: approval,                  // approval为true，加群需审批，为false时加群无需审批
				},
				success: function (resp) {
					console.log("success", resp)
				},
				error: function () { }
			};
			WebIM.conn.createGroupNew(options);
		},
		//将好友加入群组
		onInviteGroup: function (context, payload) {
			console.log("onInviteGroup", payload)
			const { select_id,select_name } = payload
			let option = {
				users: select_id,
				groupId: select_name
			};
			WebIM.conn.inviteToGroup(option);
		},
		//同意申请进群
		onAgreeJoinGroup: function (context, payload) {
			const {joinName ,joinGroupId } = payload
			let options = {
				applicant: joinName,                          // 申请加群的用户名
				groupId: joinGroupId,                              // 群组ID
				success: function (resp) {
					console.log(resp);
				},
				error: function (e) { }
			};
			WebIM.conn.agreeJoinGroup(options);
		},
		//拒绝申请进群
		onRejectJoinGroup: function (context, payload) {
			const {joinName ,joinGroupId } = payload
			let options = {
				applicant: joinName,                // 申请加群的用户名
				groupId: joinGroupId,                    // 群组ID
				success: function (resp) {
					console.log(resp);
				},
				error: function (e) { }
			};
			WebIM.conn.rejectJoinGroup(options);
		},
		//修改群组详情
		onUpdataGroupInfo: function (context, payload) {
			debugger
			console.log("onUpdataGroupInfo", payload)
			const { select_id,updateName,updateDesc } = payload
			let option = {
				groupId: select_id,
				subject: updateName,                         // 群组名称
				description: updateDesc,  // 群组简介
				success: function () {
					console.log('Change Group Names Success!');
				}
			};
			WebIM.conn.modifyGroup(option);
		},
		//设置管理员
		onSetAdmin: function (context, payload) {
			const { select_id, select_name } = payload
			let options = {
				groupId: select_id,            // 群组id
				username: select_name,              // 用户名
				success: function (resp) { },
				error: function (e) { }
			};
			WebIM.conn.setAdmin(options);
		},
		//取消管理员
		onRemoveAdmin: function (context, payload) {
			const { select_id, select_name } = payload
			let options = {
				groupId: select_id,             // 群组id
				username: select_name,               // 用户名
				success: function (resp) { },
				error: function (e) { }
			};
			WebIM.conn.removeAdmin(options);
		},
		//添加群组禁言
		onAddMute: function (context, payload) {
			console.log("onAddMute", payload)
			const { select_id, select_name } = payload
			let options = {
				username: select_name,                      // 成员用户名
				muteDuration: 886400000,               // 禁言的时长，单位是毫秒
				groupId: select_id,
				success: function (resp) {

				},
				error: function (e) { }
			};
			WebIM.conn.mute(options);
		},
		//移除禁言
		onRemoveMute: function (context, payload) {
			console.log("onRemoveMute", payload)
			const { select_id, select_name } = payload
			let options = {
				groupId: select_id,                  // 群组ID
				username: select_name,                    // 成员用户名
				success: function (resp) { },
				error: function (e) { }
			};
			WebIM.conn.removeMute(options);
		},
		//添加群组黑名单
		onAddGroupBlack: function (context, payload) {
			console.log("onAddGroupBlack", payload)
			const {select_id,select_name} = payload
			let options = {
				groupId: select_id,                     // 群组ID
				username: select_name,                         // 将要被加入黑名单的用户名
				success: function (resp) {
					console.log("Response: ", resp);
				},
				error: function (e) { }
			};
			WebIM.conn.groupBlockSingle(options);
		},
		//移除群组黑名单
		onRemoveGroupBlack: function (context, payload) {
			const {select_id,removeGroupName} = payload
			var options = {
				groupId: select_id,                     // 群组ID              
				username: removeGroupName,                             // 需要移除的用户名
				success: function (resp) {
					console.log("移除成功Response: ", resp)
				},
				error: function (e) { }
			}
			WebIM.conn.removeGroupBlockSingle(options);
		},
		//获取群组黑名单
		onGetGroupBlack: function (context, payload) {
			console.log("onGetGroupBlack", payload)
			let option = {
				groupId: payload.select_id,
				success: function (list) {
					let blackName = list.data
					context.commit("updateGroupBlack",blackName)
				},
				error: function () {
					console.log('Get group black list error.');
				}
			};
			WebIM.conn.getGroupBlacklistNew(option);
		},
		//退出群组
		onQuitGroup: function (context, payload) {
			console.log("onQuitGroup", payload)
			let option = {
				groupId: payload.select_id,
				success: function () {
					Vue.$store.dispatch('onGetGroupUserList')
					this.$forceUpdate();
				},
				error: function () {
					console.log('Leave room faild');
				}
			};
			WebIM.conn.quitGroup(option);
		},
		//解散群组
		onDissolveGroup: function (context, payload) {
			console.log("onDissolveGroup",payload)
			let option = {
				groupId: payload.select_id,
				success: function () {
					console.log('Destroy group success!');
					Vue.$store.dispatch('onGetGroupUserList')
					this.$forceUpdate();
				}
			};
			WebIM.conn.dissolveGroup(option);
		}
	},
	getters: {
		onGetPublicGroup(state) {
			return state.publicGroupList;
		},
		onGetGroupinfo(state) {
			return state.groupInfo[item];
		}
	}

}
export default Group;