const mongoose = require('mongoose');
const { SurveyQuestion, SurveyOption, CareerField, SurveyFuzzy } = require('../models');

const getSurveyQuestions = async (params) => {
	return SurveyQuestion.find({}).populate('options');
}

const generateResult = async (params) => {

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
