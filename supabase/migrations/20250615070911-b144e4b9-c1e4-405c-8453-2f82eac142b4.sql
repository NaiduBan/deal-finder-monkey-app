
-- Add a 'sponsored' column to the Offers_data table to mark offers for promotion.
ALTER TABLE "public"."Offers_data"
ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false;
