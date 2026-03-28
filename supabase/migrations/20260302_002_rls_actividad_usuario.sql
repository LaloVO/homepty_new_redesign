-- Migration: Add UPDATE and DELETE RLS policies for actividad_usuario
CREATE POLICY "Users can update own activity"
  ON public.actividad_usuario
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own activity"
  ON public.actividad_usuario
  FOR DELETE
  USING (auth.uid() = usuario_id);
