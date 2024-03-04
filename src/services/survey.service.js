const mongoose = require('mongoose');
const { SurveyQuestion, SurveyOption, CareerField, SurveyFuzzy, UserSurveyAnswer } = require('../models');

const getSurveyQuestions = async (params) => {
	return SurveyQuestion.find({}).populate('options');
}

const generateResult = async (params, user_id) => {
	const surveyAnswer = await UserSurveyAnswer.findOne({ user_id });
	if (surveyAnswer) {
		surveyAnswer.survey_answers = params
		surveyAnswer.save()
	} else {
		await UserSurveyAnswer.create({
			user_id,
			survey_answers: params,
		})
	}
	const questionArr = params.map((item) => item.question_id);
	const optionArr = params.map((item) => item.option_id).flat();
	const surveyFuzzies = await SurveyFuzzy.find({
		question_id: { $in: questionArr },
		option_id: { $in: optionArr },
	})
	const sums = {};
	surveyFuzzies.forEach(item => {
			const { fuzzy_value, weight, field_id } = item;
			const product = fuzzy_value * weight;
			sums[field_id] = (sums[field_id] || 0) + product;
	});
	const sortedSums = Object.fromEntries(
    Object.entries(sums).sort(([,a],[,b]) => b - a)
	);
	const ids = Object.entries(sortedSums).slice(0, 3).map(([key, value]) => key)
	const matchedCareer = await CareerField.find({_id: { $in: ids }});
	const bestMatched = matchedCareer[0];
	const secondMatched = matchedCareer.slice(1, 3);

	return {
		bestMatched,
		secondMatched,
	};
	// const coll = await CareerField.findById('65dee9c000b480478cbc56ad')
	// coll.for_you_title = 'Nếu bạn có khả năng giải quyết vấn đề nhanh chóng, tinh thần hướng ngoại và kiến thức kỹ thuật đa dạng, thì lĩnh vực Hỗ trợ Kỹ thuật là sự lựa chọn phù hợp với bạn.',
	// coll.description = 'Tập trung vào việc cung cấp hỗ trợ và giải quyết các vấn đề kỹ thuật liên quan đến sản phẩm và dịch vụ công nghệ. Các chuyên gia hỗ trợ kỹ thuật thường là người chịu trách nhiệm giải đáp các câu hỏi của khách hàng, xử lý các sự cố kỹ thuật và cung cấp giải pháp cho các vấn đề phát sinh.'
	// await coll.save()
}

const createQuestions = async () => {
	// await SurveyQuestion.deleteMany({})
	// await SurveyOption.deleteMany({})
	const careersData = [
		{ title: 'Phát triển phần mềm / Web / Mobile' },
		{ title: 'Mạng máy tính' },
		{ title: 'An toàn thông tin' },
		{ title: 'Điện toán đám mây' },
		{ title: 'Trí tuệ nhân tạo và học máy' },
		{ title: 'Quản trị dữ liệu' },
		{ title: 'Phần cứng' },
		{ title: 'Hỗ trợ kỹ thuật' }
	];
	
	
	try {
    // Insert careers into the database
    const careers = await CareerField.insertMany(careersData);
    console.log('Careers seeded successfully:', careers);
  } catch (error) {
    console.error('Error seeding careers:', error);
  }
}

const createFuzzy = async () => {
	const question_id = '65dee532b1c0e24598f97cf6';
	const option_ids = [
		'65dee532b1c0e24598f97ce1',
		'65dee532b1c0e24598f97ce2',
		'65dee532b1c0e24598f97ce3',
		'65dee532b1c0e24598f97ce4',
		'65dee532b1c0e24598f97ce5',
	];
	// await SurveyFuzzy.deleteMany({ option_id: { $in: option_ids } })
	const field_ids = [
		'65dee26a05f026349c92117c',
		'65dee9c000b480478cbc56a7',
		'65dee9c000b480478cbc56a8',
		'65dee9c000b480478cbc56a9',
		'65dee9c000b480478cbc56aa',
		'65dee9c000b480478cbc56ab',
		'65dee9c000b480478cbc56ac',
		'65dee9c000b480478cbc56ad',
	];
	const fuzzy_values = [
		[30,20,25,15,20,15,10,10],
		[20,20,15,10,20,10,5,5],
		[20,25,30,25,15,20,10,10],
		[20,20,15,30,25,30,15,10],
		[10,15,15,20,20,25,60,65],
	];
	const fuzzyCollection = []
	option_ids.forEach((option_id, oindex) => {
		field_ids.forEach((field_id, findex) => {
			fuzzyCollection.push({
				question_id: mongoose.Types.ObjectId(question_id),
				option_id: mongoose.Types.ObjectId(option_id),
				field_id: mongoose.Types.ObjectId(field_id),
				fuzzy_value: fuzzy_values[oindex][findex],
				weight: 1.2,
			})
		})
	})

	try {
    const fuzzy = await SurveyFuzzy.insertMany(fuzzyCollection);
    console.log('fuzzy seeded successfully:', fuzzy);
  } catch (error) {
    console.error('Error seeding careers:', error);
  }
}

module.exports = {
	getSurveyQuestions,
	generateResult,
	createQuestions,
	createFuzzy,
};
