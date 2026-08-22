HalliSavi – modified site package

This package is the frontend site prepared from the uploaded project.

Backend/Supabase work is intentionally NOT completed in this package yet.
Next step: configure the Supabase database, RLS policies, Storage policies,
and then wire orders/events/news/admin data to Supabase.

Important:
- Do not put a Supabase service-role/secret key in frontend files.
- The browser may use only the publishable/anon key with appropriate RLS.
- Keep your existing Supabase project URL/key configuration unless changing it deliberately.

Suggested test order:
1. Open index.html / deploy to GitHub Pages.
2. Test product listing and product detail.
3. Test checkout UI without assuming persistence.
4. Test admin login.
5. Then configure Supabase backend.
