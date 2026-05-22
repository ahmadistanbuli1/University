import type { PrismaClient } from '@prisma/client';
import { UNIVERSITY_STRUCTURE } from './structure-data.js';

/** Upsert colleges and departments so registration always has the canonical list. */
export async function seedUniversityStructure(prisma: PrismaClient) {
  for (const collegeSeed of UNIVERSITY_STRUCTURE) {
    let college = await prisma.college.findFirst({ where: { name: collegeSeed.name } });
    if (!college) {
      college = await prisma.college.create({
        data: { name: collegeSeed.name, description: collegeSeed.description },
      });
    } else {
      college = await prisma.college.update({
        where: { id: college.id },
        data: { description: collegeSeed.description },
      });
    }

    for (const deptSeed of collegeSeed.departments) {
      await prisma.department.upsert({
        where: { code: deptSeed.code },
        create: {
          code: deptSeed.code,
          name: deptSeed.name,
          description: deptSeed.description,
          collegeId: college.id,
        },
        update: {
          name: deptSeed.name,
          description: deptSeed.description,
          collegeId: college.id,
        },
      });
    }
  }
}
