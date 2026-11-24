-- storage.remove() necesita poder leer el objeto: permitir que cada usuario lea los suyos.
create policy "yura_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'yura' and owner = (select auth.uid()));
