import { prisma } from "../lib/prisma.js";
import { SessionPayload } from "@devtracker/types";
import { ProjectRepository } from "./project.repository.js";
import { ActivityRepository } from "./activity.repository.js";

export class SessionRepository {
    private readonly projectRepository = new ProjectRepository();
    private readonly activityRepository = new ActivityRepository();

    async create(
        accountId: string,
        session: SessionPayload
    ) {
        return prisma.$transaction(async (tx) => {
            const project = session.project
                ? await this.projectRepository.findOrCreate(
                    tx,
                    accountId,
                    session.project
                )
                : null;

            const createdSession = await tx.session.create({
                data: {
                    accountId,
                    projectId: project?.id ?? null,
                    startedAt: new Date(session.startTime),
                    endedAt: new Date(session.lastActivity),
                    durationMs: session.lastActivity - session.startTime
                }
            });

            await this.activityRepository.createMany(
                tx,
                accountId,
                createdSession.id,
                session.events
            );

            return createdSession;
        });
    }
}