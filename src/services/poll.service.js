const httpStatus = require('http-status');
const { Poll, User, PollOption } = require('../models');
const ApiError = require('../utils/ApiError');

const getPollList = async () => {
	return await Poll.find({}).populate({
		path: 'options',
		populate: {
			path: 'chosen_users',
			model: 'User' // Assuming your User model is named 'User'
		}
	})
}

const getOptionUsers = async (option_id) => {
	return await PollOption.findById(option_id).populate('chosen_users');
}

const vote = async (user_id, option_id) => {
	const option = await PollOption.findById(option_id);
	if (option) {
		const poll = await Poll.findById(option.poll_id);
		if (!poll) {
			throw new Error('Poll not found');
		}
		const chosenUsers = option.chosen_users;
		chosenUsers.push(user_id);
		option.chosen_users = [...chosenUsers];
		await option.save()
		if (!poll.is_mutiple_choice) {
			await PollOption.updateMany({
				poll_id: option.poll_id,
				_id: { $ne: option_id }
			}, {
				$pull: { chosen_users: user_id }
			});
		}
		return option;
	} else {
		throw new Error('Option not found');
	}
}

module.exports = {
  getPollList,
	getOptionUsers,
	vote,
};
