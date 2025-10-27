-- Allow authenticated users to read Tax merchants
create policy "Allow public read access for Tax merchants"
on public.merchants
for select
using (subcategory = 'Tax');