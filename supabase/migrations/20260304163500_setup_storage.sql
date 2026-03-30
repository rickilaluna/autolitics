-- Setup storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "vehicle_images_public_read" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'vehicle-images');

-- Authenticated members can upload
CREATE POLICY "vehicle_images_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images');

-- Authenticated members can update
CREATE POLICY "vehicle_images_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-images');

-- Authenticated members can delete
CREATE POLICY "vehicle_images_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images');
