
const pdfParse = require("pdf-parse")
const generateInterviewReport = reqiore("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


async function generateInterviewReportController(req,res){

    const resumeContent = pdfParse(req.file.buffer)
    const {selfDescription,jobDescription} = req.body
    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume:resumeContent,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
        message:"Interview report generates successfully",
        interviewReport
    })


}


module.exports = {generateInterviewReportController}