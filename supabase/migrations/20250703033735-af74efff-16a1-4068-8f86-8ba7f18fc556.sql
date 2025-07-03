-- Add banner column to Offers_data table to mark offers that can be displayed as banners
ALTER TABLE "public"."Offers_data"
ADD COLUMN "banner" BOOLEAN NOT NULL DEFAULT false;