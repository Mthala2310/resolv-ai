-- CreateTable
CREATE TABLE "complaint_feedbacks" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_feedbacks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "complaint_feedbacks" ADD CONSTRAINT "complaint_feedbacks_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_feedbacks" ADD CONSTRAINT "complaint_feedbacks_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
