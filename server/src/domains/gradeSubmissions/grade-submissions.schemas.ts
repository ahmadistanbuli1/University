import { z } from 'zod';



const practicalLineSchema = z.object({

  studentId: z.string().uuid(),

  practicalScore: z.coerce.number().min(0).max(40),

});



const theoryLineSchema = z.object({

  studentId: z.string().uuid(),

  theoryScore: z.coerce.number().min(0).max(60),

});



export const facultyCourseIdParamSchema = z.object({

  facultyCourseId: z.string().uuid(),

});



export const savePracticalDraftSchema = z.object({

  lines: z.array(practicalLineSchema).min(1),

});



export const saveTheoryDraftSchema = z.object({

  lines: z.array(theoryLineSchema).min(1),

});



export const rejectSubmissionSchema = z.object({

  rejectionReason: z.string().min(3).max(500),

});



export const updatePracticalLinesSchema = savePracticalDraftSchema;

export const updateTheoryLinesSchema = saveTheoryDraftSchema;


