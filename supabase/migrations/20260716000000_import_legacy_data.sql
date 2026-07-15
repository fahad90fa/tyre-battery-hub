-- Legacy data import: Django db.sqlite3 -> Supabase
-- Generated 2026-07-15. Run AFTER 20260715120000_accounts_payments_udhar.sql.
begin;

-- Safety guard: refuse to run twice.
do $$ begin
  if exists (select 1 from public.merchants) or exists (select 1 from public.products) then
    raise exception 'Import aborted: merchants/products tables are not empty (data already imported?)';
  end if;
end $$;


-- ===== Merchant accounts (24) =====
insert into public.merchants (id, name, phone, email, address, cnic, notes, opening_balance, current_balance) values
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'Abdullah Tyre DG Khan', null, 'jdjdjdkcjd@gmail.com', null, null, 'Imported from old system (MTB147d504e7e)', 0, 0),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'Moen Sunfull/ Evergreen Tyre', null, 'hdhdndjdjd@gmail.com', null, null, 'Imported from old system (MTBe1549ac79a)', 0, 0),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'Alnawaz Trader / Azam', null, 'jejdjdidid@gmail.com', null, null, 'Imported from old system (MTBd4785c6d2b)', 0, 0),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'Hassan Iqbal Lahore', null, 'hdjdieowke@gmail.com', null, null, 'Imported from old system (MTB65e50847ed)', 0, 0),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'Abdula waris Tyre / Shazaman', null, 'isirueks@gmail.com', null, null, 'Imported from old system (MTB2482064def)', 0, 0),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'Imran STD / Hifly', null, 'jaiqowidbd@gmail.com', null, null, 'Imported from old system (MTB8779fdbd37)', 0, 0),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'Hanzala iqbal / Zmax Tyre', null, 'akhrismrhs@gmail.com', null, null, 'Imported from old system (MTB08fc730a83)', 0, 0),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'Awami Tyre / zeeshan jahngir', null, 'ahsysishxjd@gmail.com', null, null, 'Imported from old system (MTB615f6a89c7)', 0, 0),
  ('6ad2c367-bbe0-48c0-bfe5-69cdefb39c1d', 'Usman LEDs lahore', null, 'jeiwishfodie@gmail.com', null, null, 'Imported from old system (MTB6340052fdd)', 0, 0),
  ('ea730afe-a3d6-4410-ae59-7c07f1164ddd', 'Moeez Trader Mats Lahore', null, 'wuduehsid@gmail.com', null, null, 'Imported from old system (MTB42f275acb0)', 0, 0),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'Trible Battery Multa', null, 'mshrydvehd@gmail.com', null, null, 'Imported from old system (MTBec632de5b8)', 0, 0),
  ('edb6c7de-bfce-41ef-835d-5cab72f00d38', 'Daewoo battery Ameer hamza', null, 'whdueydkdjdje@gmail.com', null, null, 'Imported from old system (MTB1f6b7e27b9)', 0, 0),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'Olampia Traders / Haseeb', null, 'jayeudlfud@gmail.com', null, null, 'Imported from old system (MTBace9cde685)', 0, 0),
  ('838110c5-e7c5-43f9-88a1-79f706013489', 'Irtaza Car Decoration item lahore', null, 'jahdufiejc@gmail.com', null, null, 'Imported from old system (MTB3cc1f38f8e)', 0, 0),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'Nasa Product pakistan battery', null, 'jaieoworyeksn@gmail.com', null, null, 'Imported from old system (MTBdaabd897cf)', 0, 0),
  ('1f61b368-e144-4ccf-8e80-bd2628162667', 'Waqar Brother car care lahore', null, 'wkiei@gmail.com', null, null, 'Imported from old system (MTBabc16e3bbc)', 0, 0),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'Rauf Tyre karachi', '03452329514', 'nsjdjdmdid@gmail.com', null, 'None', 'Imported from old system (MTBefaab029a5)', 0, 0),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'Lucky Tyre / Umar', null, 'jasucbrienrye@gmail.com', null, null, 'Imported from old system (MTB5c1519ffe0)', 0, 0),
  ('73a72839-e378-472c-9776-981780828ced', 'Multan Tyre Center / MTC Waseem Sb', null, 'kheiugfksadhfdug@gmaill.com', null, null, 'Imported from old system (MTB07eb7938ec)', 0, 0),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'Rahet Battery / Mubashar', null, 'asjwhd@gmail.com', null, null, 'Imported from old system (MTB6899d59100)', 0, 0),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'Daewoo Battery / Talha', null, 'treetcompany@gmail.com', null, null, 'Imported from old system (MTBbde81077e2)', 0, 0),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'Phoenix Battery  Dealership', null, 'info@phoenixbattery.com.pk', null, null, 'Imported from old system (MTB25d6162e4b)', 0, 0),
  ('c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4', 'Ayaz Khan / Nasir and sons', null, 'ayazkhan@gmail.com', null, null, 'Imported from old system (MTBaf0dcc4af0)', 0, 0),
  ('e4c326dd-eab1-4561-9475-e3e7c1520323', 'Apex Lithium/ Anas', null, 'apexsolar@gmail.com', null, null, 'Imported from old system (MTB80acfd3282)', 0, 0);

-- ===== Customer (client) accounts (4) =====
insert into public.clients (id, name, phone, email, address, cnic, notes, opening_balance, current_balance) values
  ('76287983-621f-4213-aabf-ae126ffa782c', 'Ali / Ahsan Iqbal', null, 'whdhdksjd@gmail.com', null, null, 'Imported from old system (MTBef4d3765e8)', 0, 0),
  ('49b32f88-7a57-44e9-a7c1-a4f1ecd16336', 'Jaffar Bagga sher', null, 'jaieidbdudjxhss@gmail.com', null, null, 'Imported from old system (MTBaa1dd28f92)', 0, 0),
  ('52fff8e5-b09d-4112-bd13-570265b8d57f', 'g', null, 'gjuyujyjh@gmail.com', null, null, 'Imported from old system (MTB814a7e8eb0)', 0, 0),
  ('1df1dd5e-789a-42d1-86f8-a4597f5d7b22', 'Muhammad Fahad', null, 'fahadyousaf90@gmail.com', null, null, 'Imported from old system (MTB53403d0463)', 0, 0);

-- ===== Legacy categories (3) — skipped if the slug already exists =====
insert into public.categories (id, name, slug, display_order) select '4e80b35a-90c2-47b8-8244-f5a2156148d4', '145/70R12', '14570r12', 100 where not exists (select 1 from public.categories where slug = '14570r12');
insert into public.categories (id, name, slug, display_order) select '3f624086-225e-4463-8eab-7298b191d5d2', '145R12', '145r12', 101 where not exists (select 1 from public.categories where slug = '145r12');
insert into public.categories (id, name, slug, display_order) select '2ff770ae-2e0d-42dd-b5f8-16db42de2199', '155R12', '155r12', 102 where not exists (select 1 from public.categories where slug = '155r12');

-- ===== Legacy subcategories (3) =====
insert into public.subcategories (category_id, name, slug) select '4e80b35a-90c2-47b8-8244-f5a2156148d4', 'Sunfull', 'sunfull' where exists (select 1 from public.categories where id = '4e80b35a-90c2-47b8-8244-f5a2156148d4');
insert into public.subcategories (category_id, name, slug) select '4e80b35a-90c2-47b8-8244-f5a2156148d4', 'Hilfy', 'hilfy' where exists (select 1 from public.categories where id = '4e80b35a-90c2-47b8-8244-f5a2156148d4');
insert into public.subcategories (category_id, name, slug) select '3f624086-225e-4463-8eab-7298b191d5d2', 'Sunfull', 'sunfull' where exists (select 1 from public.categories where id = '3f624086-225e-4463-8eab-7298b191d5d2');

-- ===== Products (638) =====
insert into public.products (id, product_name, selling_price, purchase_price, quantity_in_stock, description, is_featured, is_deal) values
  ('b3198079-a292-4c3c-8514-005c61d6000b', 'Sunfull', 7700, 7700, 35, null, false, false),
  ('8a878f60-9742-48f6-be69-274d08cfcbcb', 'Sunfull 145/70R12', 7700, 7700, 35, null, false, false),
  ('dfe64997-ea8a-4659-8a6d-f85a29793f76', 'Sunfull 155/70R12', 7800, 7800, 11, null, false, false),
  ('f48d9c4d-8b21-421b-b65b-d49f4ecdaaeb', 'Sunfull 165/70R13', 10200, 10200, 15, null, false, false),
  ('ebc87171-33d5-4db6-8528-ecda4b6babcd', 'Sunfull 175/70R13', 10200, 10200, 15, null, false, false),
  ('ab22a245-18f6-48bd-821a-6fb86be4b7ef', 'Sunfull 165/65R14', 10700, 10700, 2, null, false, false),
  ('20cbaec2-4a78-413f-b047-6a9e7d055b4b', 'Sunfull 185/70R13', 11700, 11700, 6, null, false, false),
  ('1f744ea6-332a-42a8-8d01-c91bf0fd2505', 'Sunfull 145R12', 8000, 8000, 13, null, false, false),
  ('54ddb1d5-150d-4d6f-9916-d006d7c6bc7b', 'Sunfull 155R12', 8500, 8500, 7, null, false, false),
  ('345ba395-487c-4240-ab30-5baf1937aa71', 'Sunfull 185/65R15', 13500, 13500, 2, null, false, false),
  ('87460842-8bd5-4fc3-8078-237b0a112bb1', 'Sunfull 195/65R15', 13700, 13700, 11, null, false, false),
  ('17a338c2-2a26-439c-aaa9-90009ed2b9b7', 'Sunfull 195R14', 17000, 17000, 8, null, false, false),
  ('9941cd70-68a4-4282-b2ba-c1b3ffb85064', 'Sunfull 185R14', 15200, 15200, 9, null, false, false),
  ('d7a17e4e-525c-4586-a1a3-a11111332920', 'Sunfull 650-16', 30000, 30000, 7, null, false, false),
  ('5ae4a125-3baf-4b76-837e-df8ccd33d0d8', 'Evergreen 195R14', 21400, 21400, 18, null, false, false),
  ('3952bec9-9db2-4646-899e-67dda5aabb7b', '185R14', 18500, 19000, 45, null, false, false),
  ('7905d6ca-4038-4a33-aff7-908c6fc9cd8e', 'Evergreen 195R15', 23700, 23700, 12, null, false, false),
  ('3859c0a0-b6e0-469a-bb7e-a08d2e334723', 'Evergreen 195/65R15', 15600, 15600, 2, null, false, false),
  ('80ff625e-44f7-467f-bc2b-9fbdb2d04234', 'Evergreen 185/65R15', 15000, 15000, 21, null, false, false),
  ('a500e188-96de-422f-9cb1-e1a5f8a2a4f9', 'Evergreen 175/70R14', 15900, 15900, 12, null, false, false),
  ('ce124eb1-fee2-4730-a6aa-287058dbfdfe', 'Evergreen 165/65R14', 11700, 11700, 1, null, false, false),
  ('0ede6860-2dce-4e30-ab5d-ece57003b5ad', 'Evergreen 175/70R13', 11200, 11200, 15, null, false, false),
  ('72a5d0fe-ec4a-47de-a84b-1e2db1209457', 'Evergreen 165/70R13', 11000, 11000, 11, null, false, false),
  ('d06c8f5d-23af-4491-be2c-b3382cafb659', 'Evergreen 145R12', 10000, 11500, 5, null, false, false),
  ('14763438-0af1-4b0a-b481-b9541af3e0d7', 'Evergreen 155R12', 11000, 11000, 5, null, false, false),
  ('fcef411d-f523-4cb6-bcdd-a542b37128b9', 'Evergreen 215/55R16', 19700, 19700, 8, null, false, false),
  ('05258a8e-cb0d-4023-9a13-f434391f8e34', 'Evergreen 215/60R16', 19500, 19500, 8, null, false, false),
  ('aa8f911e-a216-4331-a46e-06c7a3cad154', 'Evergreen 215/70R15', 25500, 25500, 2, null, false, false),
  ('b73856e2-101f-421b-b25a-3dea8bb43267', 'Evergreen 155/70R12', 8900, 8900, 4, null, false, false),
  ('6529308b-65ee-49c5-ad9c-a902ffee3d52', 'Evergreen 185/70R14', 14200, 14200, 4, null, false, false),
  ('edb632a7-5205-4688-a91c-711166000088', 'Hifly 145/70R12', 7600, 7600, 7, null, false, false),
  ('02dffc78-0840-46c5-bdf9-26fee27ff76e', 'Hifly 155/70R12', 8000, 8000, 2, null, false, false),
  ('e3c2ec0d-0c58-4ce7-a786-ad87c3993eb6', 'Hifly 165/70R13', 9900, 9900, 10, null, false, false),
  ('cac16bbe-6e72-4507-9de5-222e6f8a956b', 'Hifly 175/70R13', 9900, 9900, 10, null, false, false),
  ('38c3da6a-4e87-4578-a212-9813f04d0841', 'Hifly  185/65R15', 13300, 13300, 3, null, false, false),
  ('ce01a18c-2a24-4207-94b4-8f77e24cfaba', 'Hifly  195/65R15', 13500, 13500, 18, null, false, false),
  ('ea2c2b52-783b-4937-810c-8be56b8d6526', 'Hifly 165/70R12', 9000, 9000, 6, null, false, false),
  ('b2b9881a-0bec-4783-9a76-99ece7f81bc6', 'Hifly 145R12', 7600, 7600, 3, null, false, false),
  ('7a9cbc0e-f7b9-4cd3-bceb-735f626b4a52', 'Hifly 175/70R14', 12000, 12000, 8, null, false, false),
  ('7ae91975-10a2-4ce9-aee6-24e821d936e2', 'Hifly 165/70R14', 10000, 10000, 8, null, false, false),
  ('f830ee2e-2c0e-48ef-beb1-da79c69b0fbb', 'Hifly 185/65R14', 12000, 12000, 6, null, false, false),
  ('7278e666-e119-432d-9486-b3f39d7ff162', 'Hifly 185/70R14', 12400, 12400, 8, null, false, false),
  ('52a40f30-b749-4412-86ca-77bfa83241c7', 'Hifly 205/55R16', 16000, 16000, 4, null, false, false),
  ('2215b7d2-88df-424b-8e73-0968d0f92702', 'Hifly 205/60R16', 16100, 16100, 12, null, false, false),
  ('a086a44f-0387-4230-b575-325aff8bc56e', 'Hilfy 215/60R16', 17600, 17600, 8, null, false, false),
  ('6de6b435-7597-45ac-8e78-b1e68054ee24', 'Hifly 145/80R13', 9500, 9500, 24, null, false, false),
  ('e76a0b24-8069-4ec6-8652-f07c10bb1dd5', 'Delmax 175/65R14', 11500, 11500, 4, null, false, false),
  ('82ecf615-2ab1-40b6-8b29-006dd799da07', 'Delmax 185/70R14', 12500, 12500, 2, null, false, false),
  ('8bc54924-9c51-4f22-b273-2a7e854b9c63', 'Mazzini 195/70R14', 15000, 15000, 4, null, false, false),
  ('f57a6995-92b5-4a0f-96b0-09cc88e3dab3', 'Hiscore 175/65R14', 12000, 12000, 4, null, false, false),
  ('c692cee3-cd64-40c2-9ea3-05cd3b279f74', 'Delmax 195R15', 19400, 19400, 6, null, false, false),
  ('81ac0200-f86f-49ec-840e-177cf4b6e30c', 'Composal 145R12', 7850, 7850, 7, null, false, false),
  ('56e62de4-7040-413a-975c-6c0326c5a2f6', 'Mazzini 196/65R15', 13000, 13000, 2, null, false, false),
  ('7d32f702-436f-440e-a4e1-039f307c4219', 'Tracmax 195/65R15', 13500, 13500, 2, null, false, false),
  ('b63ff83c-aed6-47b2-96bd-6ff88117c198', 'Windforce 195/65R15', 12500, 12500, 2, null, false, false),
  ('4264e46a-e96a-4ad5-849b-271fba79012d', 'Mazzini 185/65R15', 13000, 13000, 2, null, false, false),
  ('39d6b661-9354-4153-a9dc-ddc86ca2eae7', 'Tracmax 165/70R13', 10400, 10400, 2, null, false, false),
  ('b8db23ea-ee22-4400-bb66-cdb46a80e1c8', 'Agate 145/80R13', 10000, 10000, 8, null, false, false),
  ('b93e6e6c-ec67-48f5-a8fb-63375618a6f5', 'Kapsan 195/65R15', 11500, 11500, 6, null, false, false),
  ('5802e98a-e32f-4828-aa21-d0d444bdd2ca', 'Ovation 195/65R15', 12500, 12500, 0, null, false, false),
  ('32a853aa-4881-42b8-a84b-2bfdfcc808ce', 'Bridgestone 145/80R12', 12000, 12000, 6, null, false, false),
  ('103632df-9414-43e2-a384-62f8347395a3', 'Lassa 215/70R15', 29000, 29000, 6, null, false, false),
  ('1476d368-926a-4f9d-876d-026a7b1c350d', 'Zmax 185R14', 14800, 14800, 6, null, false, false),
  ('8f3f2a1a-55be-441c-a074-23c2d5a20dfa', 'Zmax 195R14', 16500, 16500, 9, null, false, false),
  ('172252c0-84ee-44bc-a6e3-c416dd1cfecb', 'Ovation 31-10-50R15', 29000, 29000, 2, null, false, false),
  ('23a064d9-de77-4ce7-a797-5127eca76c31', 'Zmax 145/70R12', 7300, 7300, 12, null, false, false),
  ('6a31dfba-1aba-4463-84d2-c99ad26961dd', 'Zmax 145R12', 7800, 7800, 4, null, false, false),
  ('924a4a94-267a-4fe6-b36d-cd2446696f2e', 'Zmax 165/70R13', 9700, 9700, 12, null, false, false),
  ('440d835f-ca39-4b5c-9ee1-90d7262b937c', 'Zmax 175/70R13', 9700, 9700, 12, null, false, false),
  ('5368dfa2-650c-4253-a116-d9e91e9ce2c9', 'Zmax 195/65R15', 13300, 13300, 12, null, false, false),
  ('dda3f918-cce4-468d-a3c1-771d51c383b2', 'Zmax 165/65R13', 9000, 9000, 4, null, false, false),
  ('65e5a4cf-4ea5-45d1-a0b7-cf70d76809b8', 'Zmax 155R12', 8300, 8300, 4, null, false, false),
  ('a5a08cb3-894f-403a-9dbb-d38056ad05f7', 'Gallant 145/70R12', 7500, 7500, 4, null, false, false),
  ('60387931-bfa0-48e4-80c0-1cb70564a2fc', 'Aplus 145R12', 7500, 7500, 22, null, false, false),
  ('b731deea-812c-465e-a084-c1d31ff2443d', 'Goform 195/65R15', 15000, 15000, 2, null, false, false),
  ('63f6fdf5-b94e-4f4a-9ad4-1fae98a54956', 'Agate 195/65R15', 13800, 13800, 2, null, false, false),
  ('aa9c5191-0e96-4dc3-b640-0861a0b48ee6', 'Triangle 195R14', 19000, 19000, 10, null, false, false),
  ('4cfdc6a4-666c-4bc0-b850-9ccf0c268157', 'Panther 135-10 10ply', 4100, 4100, 10, null, false, false),
  ('ab2a15e4-9157-4c7f-8502-ff8d28a7ee57', 'Daimond 500-12 14ply', 6750, 6750, 10, null, false, false),
  ('0e9415b2-7273-4fc7-92cf-f118134aadd8', 'Panther 500-12 14ply', 6850, 6850, 15, null, false, false),
  ('5fb330df-4982-4b97-b5d6-d752b4f592fc', 'Panther 500-12 16ply', 8800, 8800, 10, null, false, false),
  ('246c2b73-9df2-495e-9737-c65917c9ec9a', 'Diamond 450-12 10ply', 5500, 5500, 10, null, false, false),
  ('e784f3c4-2b26-40b6-981d-13d128e4cc7f', 'Onxy 185/65R15', 14000, 14000, 2, null, false, false),
  ('ba659645-3fa6-4e33-b72c-31eacc97168f', 'Tracmax 185/65R15', 13500, 13500, 2, null, false, false),
  ('daef7e0a-7e59-4f97-bf67-6e4e3eb8697c', 'Ace LEDs H4', 5500, 5500, 6, null, false, false),
  ('ea77a6d6-756c-4985-99df-fbcdc035e7db', 'Ace LEDs H11', 5500, 5500, 6, null, false, false),
  ('7895c3f0-b669-4dcc-8e77-a65293c24677', 'Ace LEDs 9005', 5500, 5500, 6, null, false, false),
  ('3a3c8fdd-9b58-444e-a63a-1ab948ff19e2', 'Ace LEDS 9005 9000watt', 9500, 9500, 1, null, false, false),
  ('c73cf802-d099-40a5-88e6-8dbc7aad6e70', 'HT 200 Osaka 21p', 22795, 22795, 8, null, false, false),
  ('d7cb64a4-c2b1-4a3e-b3d8-6d882908fbfc', 'HT 230 Osaka 23p', 26675, 26675, 4, null, false, false),
  ('a8952918-ded1-47f1-8294-53f9cd83a6c5', 'HT 270 Osaka 27p', 32204, 32204, 1, null, false, false),
  ('d8a24225-f61b-4114-abd1-5ae9628c4e92', 'HT 160 Osaka 19p', 20622.2, 20622.2, 4, null, false, false),
  ('50094451-0a8b-490a-a1c5-35d9aa9ba316', 'HT 155 Osaka 17p', 19012, 19012, 3, null, false, false),
  ('d70ff2a0-b639-4f30-a784-d72207423799', 'HT 145 Osaka 17p', 18284.5, 18284.5, 3, null, false, false),
  ('c4c6cbcf-dc21-4c40-b4b4-bd236c5fe6e1', 'HT 115 Osaka 11p', 11737, 11737, 6, null, false, false),
  ('95bf8c4f-fe31-4f3d-8557-190ec9147d91', 'HT 60 Osaka 9p', 7144.05, 7144.05, 13, null, false, false),
  ('ba65adef-58dc-4b3d-a013-f865042a2fae', 'HT 1800 Osaka Tubular', 34435, 34435, 4, null, false, false),
  ('0de08654-0a78-4049-aafd-85b69cf1fdff', '6x130 Exide 15p', 17523, 17523, 2, null, false, false),
  ('2320ab30-d91f-4f37-9f8b-6d6afbd864d9', 'XP 230 phoenix 23p', 27489, 27489, 4, null, false, false),
  ('0eaefb57-8027-4470-af68-91d9a07e00a4', 'XP 100 phoenix 11p', 12274.5, 12274.5, 4, null, false, false),
  ('3b5daf8e-2e89-4f65-93d0-ccfaa9d0f573', 'N 110 Exide 15p', 15735.2, 15735.2, 3, null, false, false),
  ('a1df250a-b570-4ddc-b407-11d81e1d3ed2', 'HT solar 50 osaka 5p', 4499.25, 4499.25, 5, null, false, false),
  ('b59db48f-bddf-4be6-98ee-21a4338e8990', 'HT60 osaka 9p', 7144.05, 7144.05, 7, null, false, false),
  ('a28c5751-a731-46c5-913f-308c233131d7', 'HT CR65 osaka 11p mini', 8303.2, 8303.2, 17, null, false, false),
  ('edd3a8d0-cd0d-4c65-9ec6-6de48e9fa0ca', 'HT55 osaka 7p', 6232.25, 6232.25, 7, null, false, false),
  ('02d15708-cc7b-418b-870e-62810cc1d842', 'HT70 osaka 11p', 8870.65, 8870.65, 3, null, false, false),
  ('74dad60c-fcbd-4111-abef-7fc0fbc6b71c', 'HT solar50 osaka 5p', 4520.2, 4520.2, 10, null, false, false),
  ('b9509cd9-f5a0-48ab-8c75-a1f423f1977e', 'MF70 osaka 11p', 10296, 10296, 5, null, false, false),
  ('9a0265e5-10ed-4859-8944-f0166600be74', 'MF60 osaka 9p', 8217, 8217, 7, null, false, false),
  ('f7efa096-4b46-4707-8d0e-f47ba1d9be58', 'HT115 osaka 11p', 11737, 11737, 4, null, false, false),
  ('e80ffd43-6649-4f0a-8ac8-2148c93a8eaa', 'HT125z osaka 15p mini', 15175.65, 15175.65, 1, null, false, false),
  ('5bf2d58f-1848-4035-835d-54a0ec74c434', 'HT145 osaka 17p mini', 18284.5, 18284.5, 2, null, false, false),
  ('b6023918-2b98-469f-be23-379c05703b18', 'HT155 osaka 17p', 19012, 19012, 2, null, false, false),
  ('267c98f3-eb5c-48d9-a83d-176ec96cc437', 'HT135 osaka 15p', 16878, 16878, 9, null, false, false),
  ('9302b467-c9cc-4b15-ba23-5f0bcc9da30b', 'HT200 osaka 21p', 22795, 22795, 6, null, false, false),
  ('8b1b16df-4e76-4db8-9aa7-efac7169020d', 'HT230 osaka 23p', 26675, 26675, 1, null, false, false),
  ('c89379f3-d990-4e79-99e4-ff01b0c43875', 'HT270 osaka 27p', 32204, 32204, 1, null, false, false),
  ('f30133de-bdeb-4617-a331-77943d8483f9', 'HT160 osaka 19p', 20622.2, 23000, 5, null, false, false),
  ('21045e19-726c-487f-9f28-4619f02daa0d', 'MF110 osaka 13p', 15642, 15642, 1, null, false, false),
  ('c92de01e-9569-4846-a034-f60168a5313a', 'UB55 unique 9p', 7084.8, 7084.8, 1, null, false, false),
  ('fb190246-0e5d-4d01-b7ae-385e8d4e587b', 'UB45 unique 7p', 5808, 5808, 2, null, false, false),
  ('484a968e-9e31-43ca-a1d3-7ec066ec9243', 'UB125 unique 15p', 16608, 16608, 1, null, false, false),
  ('999e66aa-4977-4de8-bd40-427bb0f32be6', 'UDC225 unique 21p', 28355, 28355, 5, null, false, false),
  ('8d66a17f-efc7-4ca1-9501-b6828350cffe', 'UP1300 Toyo 21p', 25016, 25016, 2, null, false, false),
  ('50e64f50-b7fb-4fea-afd4-97f2924e2d44', 'TR1800 Toyo 19p', 27454, 27454, 2, null, false, false),
  ('f203682f-d57a-4873-9214-97371abf0e6a', 'HT110 Toyo 9p', 11368.5, 11368.5, 4, null, false, false),
  ('7529846d-4028-4f13-a127-185963f4c8d3', 'HT125 Toyo 11p', 15264, 15264, 5, null, false, false),
  ('ab38d019-e1d4-46c7-8902-b2f195bda1d2', 'HT145 Toyo 15p', 17437, 17437, 5, null, false, false),
  ('53ac1f1e-0786-4765-9929-444ab2ee90ba', 'HT145 Toyo 13p', 16430, 16430, 7, null, false, false),
  ('7b3c4ede-11bd-4ede-b3d3-c37cf2f78387', 'HT155 Toyo 17p', 19111.8, 19111.8, 3, null, false, false),
  ('2df23349-5066-4f0a-a1a1-8d690b40eeca', 'XP150 phoenix 19p', 21300, 21300, 5, null, false, false),
  ('a626285a-5083-477f-8543-350377f87ee9', 'XP200 phoenix 21p', 24060, 24060, 1, null, false, false),
  ('c1daccec-140b-4120-9859-9805116873dd', 'XP200 phoenix 23p mini', 25666, 25666, 1, null, false, false),
  ('38b30044-db45-4f61-b26b-47579f7966e7', 'UGS190 phoenix 21p', 25540, 25540, 3, null, false, false),
  ('a957a1ad-d515-4559-a851-e678c8665369', 'UGS155 phoenix 17p', 20650, 20650, 2, null, false, false),
  ('f8d70e65-5e2b-44be-8b73-87c31d8bc6a2', 'EXT130 phoenix 15p', 17400, 17400, 1, null, false, false),
  ('81f726eb-d0cd-4baf-95b4-ed14e49619c2', 'XP100 phoenix 11p', 12440, 12440, 2, null, false, false),
  ('9eb3f1b5-90d5-4172-bae6-1c4f1750643f', 'N180 exide 21p', 24542.1, 24542.1, 3, null, false, false),
  ('c4109126-2c27-4bdf-b34e-83da86c02613', 'N150 exide 19p', 21483, 21483, 7, null, false, false),
  ('a4c398d3-bd02-4ff2-a720-a052e622c30e', 'HP180 exide 19p', 23166, 23166, 3, null, false, false),
  ('b2a48d4b-119f-42b5-b021-3e9b62be14c5', 'HP200 exide 17p', 25146, 25146, 1, null, false, false),
  ('9c50fd6d-8cd3-4a70-a721-d7aea1a3696e', 'HP230 exide 21p', 30294, 30294, 3, null, false, false),
  ('613516cd-8b8a-4f7f-ac24-ef405d2079ad', 'N100 exide 11p', 12365.1, 12365.1, 4, null, false, false),
  ('3e95e6f6-0e5a-4ff6-9d18-d67c0cf7d09b', 'P170 power plus 17p', 19600, 19600, 6, null, false, false),
  ('aca83521-b3e6-4452-9f57-1357db7e4591', '6X130 exide 15p', 17305.6, 17305.6, 4, null, false, false),
  ('b161911f-be5a-435e-aacb-f6bc63d4033c', 'DRS65 Daewoo 13p', 12648, 12648, 1, null, false, false),
  ('b6684e62-acf0-4035-86a1-2f34ea5aed5d', 'DLS105 Daewoo 15p', 20400, 20400, 1, null, false, false),
  ('4faf4022-6a48-4344-8a5e-7d7853ef0f35', 'DLS80 Daewoo 13p', 17034, 17034, 2, null, false, false),
  ('9d4cd797-2d44-4103-bd74-2fa8fad9a571', 'Din600 Daewoo', 19240, 19240, 1, null, false, false),
  ('8013d148-2313-4e1f-bd64-bccc03ea8bdb', 'Din666 Daewoo', 21320, 21320, 1, null, false, false),
  ('51bb62ad-1708-4670-a5e3-3f9eae95c73d', 'Goform 155/65R14', 9700, 9700, 8, null, false, false),
  ('3d72e73c-42be-49ed-b59d-aa4c2c774e80', 'Tube 450-12 Diamond', 450, 450, 50, null, false, false),
  ('9c62472e-597b-4031-9203-85f57b32d545', 'Tube 6.50-14 Diamond', 760, 760, 25, null, false, false),
  ('c7f4666e-74e6-45b7-95c4-d55bf2c29ff7', 'Tube 6.00-16 Diamond', 850, 850, 25, null, false, false),
  ('83946fdb-913e-469b-8286-da0a43eef40a', 'Panther 6.00-16 6ply', 8800, 8800, 1, null, false, false),
  ('7c98ecb1-f597-4e0e-b2da-761066d2cd16', 'Panther 600-16 8ply', 10000, 10000, 1, null, false, false),
  ('62478402-0060-485d-9cf3-4f3bf7dd69c5', 'Tube 450-12 Diamond', 450, 450, 9, null, false, false),
  ('755dbe1f-59e6-479a-9e1b-25d42afdf8fc', 'Persentage frk 1%', 8425, 8425, 1, null, false, false),
  ('9787e9e8-c742-429c-8ab6-672d118b3daa', 'Sp50 AGS 9p', 8249.53, 8249.53, 20, null, false, false),
  ('14e4322d-ae3f-46c6-93f7-6ce75d7848e8', 'Ws45 AGS 5p', 5758.53, 5758.53, 10, null, false, false),
  ('6136ced7-f6d8-401b-a069-64604cfa57cb', 'Sp70 AGS 11p mini', 9792.53, 9792.53, 5, null, false, false),
  ('5ea8dcb2-aaa9-4b3b-b750-c67da6c7c365', 'Sp130 AGS 15p', 20230.51, 20230.51, 2, null, false, false),
  ('b6200ab4-a07b-4b7b-82ad-301877f0bde5', 'Ws150 AGS 17p', 21793.69, 21793.69, 2, null, false, false),
  ('b8ddade4-5ea1-49b8-8b11-1e7a9767b280', 'Ws165 AGS 19p', 24435.96, 24435.96, 10, null, false, false),
  ('9b79bef5-e9ee-419d-af09-4c2a5ccad8f9', 'Ws195 AGS 21p', 27491.71, 27491.71, 5, null, false, false),
  ('cd38fc86-868c-4b16-91a5-9c489835c756', 'Gx165 AGS 21p', 27229.5, 27229.5, 2, null, false, false),
  ('e3ea954a-f596-4c05-a63f-549c485e2acb', 'Sp180 AGS 21p', 27330.35, 27330.35, 3, null, false, false),
  ('f2e96b80-4387-4573-87d8-8058f15b83e7', 'MF50 AGS 9p', 9595.74, 9595.74, 15, null, false, false),
  ('f8e9ef7f-d066-4232-b5d5-92849f8cf7d0', 'MF60 AGS 11p', 10748.48, 10748.48, 15, null, false, false),
  ('2732e14b-5df8-4f7a-9316-82ef67d3fada', 'MF Din65 AGS 14p', 18391.83, 18391.83, 1, null, false, false),
  ('749d275a-7863-494f-a2b0-f61350f72c87', 'Tall2000 AGS', 43139.29, 43139.29, 2, null, false, false),
  ('81ed8e75-ab20-44cf-a44f-5fec34eb4817', 'Tall1800 AGS', 36212.5, 36212.5, 3, null, false, false),
  ('1983b098-4648-4731-9b71-37f13a3f66fa', 'Sp100 AGS 11p', 13161.6, 13161.6, 40, null, false, false),
  ('912bd918-ddc9-4876-91ae-966849564a93', 'Rovelo 145/70R12', 8090.33, 8090.33, 6, null, false, false),
  ('7c956b3d-9761-4e6c-a56e-d48baf02e373', 'Yokohama 195/65R15 china', 21500, 21500, 6, null, false, false),
  ('4b9aef90-ef27-4226-9f30-79cee5eee161', 'Yokohama 195/65R15 japan', 24000, 24000, 2, null, false, false),
  ('c0880ea5-1577-4653-a9bc-1488d080bb2a', 'Yokohama 165/65R14 japan', 18000, 18000, 4, null, false, false),
  ('7c5511df-0e58-46e0-9c6b-fd3f19f5555c', 'Yokohama 175/65R14 japan', 19500, 19500, 2, null, false, false),
  ('ebf2f98f-bd93-4be3-88ba-161f1c4d825a', 'Yokohama 215/55R16 japan', 29000, 29000, 4, null, false, false),
  ('3f5b899c-936e-435e-9a7b-45666368c3e8', 'Yokohama 185/65R15 japan', 23000, 23000, 1, null, false, false),
  ('debe613b-acc6-4b30-86f9-0e5e327768b4', 'Hifly 165/65R14', 10000, 10000, 12, null, false, false),
  ('c3481f95-aee1-4424-a73b-647c5e87a8d3', 'Hifly 145/70R12', 7500, 7500, 7, null, false, false),
  ('8cc796cb-0fea-44bf-bd08-f927e9231474', 'Hifly 145R12', 7600, 7600, 5, null, false, false),
  ('08ba13da-1020-4e93-835a-a0f62c166419', 'Hifly 185/65R15', 13200, 13200, 5, null, false, false),
  ('6e3550b1-f576-4504-a176-f901ede9a37b', 'Hifly 195R15', 19200, 19200, 10, null, false, false),
  ('44bcb919-3087-40a1-bee2-4c878a47c8a5', 'Hifly 165/65R14', 10000, 10000, 12, null, false, false),
  ('7391a53b-e4be-4336-a1a2-6ad3599ed45f', 'Hifly 145/70R12', 7500, 7500, 7, null, false, false),
  ('5a532794-c35e-4c39-a0d5-bca05f104b36', 'Hifly 145R12', 7600, 7600, 5, null, false, false),
  ('ca9ba2b6-35b4-4d6c-b57f-5d5545eb0ce8', 'Hifly 185/65R15', 13200, 13200, 5, null, false, false),
  ('eca98337-bf98-457c-ab5c-3b0f6addd04d', 'Hifly 195R15', 19200, 19200, 10, null, false, false),
  ('3779c250-6634-4826-ad68-0e7878b62888', 'Yokohama 185/65R15', 22500, 22500, 4, null, false, false),
  ('78d7303a-ff6f-409b-ae45-e2e4e9f9f662', 'Yokohama 165/65R14', 17800, 17800, 8, null, false, false),
  ('06a97e27-a176-4118-9262-f019c6aa3516', 'Tracmax 165/65R14', 10300, 10300, 8, null, false, false),
  ('1a851397-4f11-4289-b738-619031d9c96a', 'Sunny 145R12', 7800, 7800, 4, null, false, false),
  ('29ab846d-bbc5-4bf9-9de6-de4ae306f7a6', 'MF90 AGS 13p', 17654.5, 17654.5, 2, null, false, false),
  ('ba21f989-aa84-4471-8350-cf2c844620d5', 'MF90 AGS 13p', 17654.5, 17654.5, 2, null, false, false),
  ('5f20220a-1b3f-4ce7-9680-2e2ea3af2769', 'Yokohama 195/65R15', 21000, 21000, 12, null, false, false),
  ('18be4c97-ef45-4fe8-9435-73717aaa46b8', 'Sabka frk 4-1-26 sy', 63970, 63970, 1, null, false, false),
  ('936f01c4-1eb3-41e9-a283-a50ce633c065', 'Mobile Holder Magnet', 1300, 1300, 5, null, false, false),
  ('4ab95765-878b-40c5-b013-2ae1f857960c', 'Mobile Holder Dashboard', 1050, 1050, 3, null, false, false),
  ('001539da-29b0-4239-b487-7241a93a47ac', 'Mobile Holder Mirror', 800, 800, 3, null, false, false),
  ('a2a28f45-80ce-43b2-81c6-1e85a5377b9c', 'Car Ashtry', 650, 650, 10, null, false, false),
  ('909a9b1a-71f7-4fc1-830b-150d484b6022', 'Matel Key Cover', 750, 750, 8, null, false, false),
  ('be4bf3dd-94a2-494b-8fbc-471a6fe07245', 'Number Plate CVR Cover', 120, 120, 3, null, false, false),
  ('0c3e5293-7146-4214-9cc9-a6aa174af088', 'Number Plate CVR(SP)Cover', 180, 180, 2, null, false, false),
  ('9d982582-a9fb-42a4-aabb-1c06d263588f', 'Car Padel Covers', 750, 750, 10, null, false, false),
  ('79c10b6a-0441-4c18-b982-1cb301b07452', 'GMC Grill Light', 1050, 1050, 3, null, false, false),
  ('9047cf14-21a6-4579-8c12-5683dd6a8f6e', 'Car Charger 7.2 Fast', 1250, 1250, 5, null, false, false),
  ('84db32af-b75d-4dda-891d-961a0702d4a7', 'Car Key Chain', 190, 190, 24, null, false, false),
  ('85779154-a843-47d3-aab8-88a9100ac997', 'Rim Cover silver 15”', 1250, 1250, 2, null, false, false),
  ('f5ad8828-a50c-4853-a1a8-24f985330ac7', 'Rim Cover Double colr 12”', 2000, 2000, 2, null, false, false),
  ('6e39e019-f63f-4623-95e2-ef810b7756e7', 'Rim Cover Double colr 13”', 2100, 2100, 2, null, false, false),
  ('422d34d6-061b-40d0-b110-65788d663c53', 'Rim Cover Double colr 14”', 2200, 2200, 2, null, false, false),
  ('d45744bf-77ef-4320-80a6-7fec2329ac62', 'Rim Cover Double colr 15”', 2300, 2300, 2, null, false, false),
  ('394459d2-5cd4-4f2f-bad9-db08a90d164a', 'Rim Cover silver 12”', 1150, 1150, 2, null, false, false),
  ('4bf771b9-5dec-43de-ba10-5049f8973ec7', 'Rim Cover Silver 12”', 1150, 1150, 2, null, false, false),
  ('452ae9a1-237f-44de-8a77-3cf4c5fc3e19', 'Rim Cover Silver 13”', 1200, 1200, 2, null, false, false),
  ('19986878-c203-4a80-a305-6db9b9baec67', 'Rim Cover Double colr 15”', 2300, 2300, 2, null, false, false),
  ('efeab33f-807e-44e6-b13d-565450f24cb4', 'Rim Cover Double colr 15”', 2300, 2300, 2, null, false, false),
  ('06f91d9a-3c59-44c9-a314-3c830cdbd836', 'Rim Cover Double colr 14”', 1850, 1850, 2, null, false, false),
  ('0c4936e2-722e-43ae-b1f8-e0c204b6850e', 'UniversalMat miniblack 5p', 1000, 1000, 2, null, false, false),
  ('9d7048df-68f9-42eb-ac66-b50405d0a508', 'UniversalMat minibeech 5p', 2000, 2000, 2, null, false, false),
  ('f1cbe870-b4bb-4e24-a251-eb22ae506fa8', 'UniversalMat sedan 3p', 2600, 2600, 3, null, false, false),
  ('bb5d7c46-f2b0-40f4-8e37-ae514b85fb9f', 'UniversalMat Sedan 3p', 2600, 2600, 3, null, false, false),
  ('4e7f9dcb-09f7-4639-a264-d1c4219281d5', 'Latex Car Mat Mehran 3p', 2800, 2800, 2, null, false, false),
  ('266a3ea7-93e5-4bd1-81c3-3cef96d40fef', 'Latex Car Mat Alto New 3p', 2800, 2800, 2, null, false, false),
  ('03243184-c04b-4d35-92f3-27dc4c0277a2', 'Latex CarMat CultusNew 3p', 2800, 2800, 2, null, false, false),
  ('5bbe42a5-f58a-496e-ad43-ba74d408160d', 'Latex Car Mat SwiftNew 3p', 3300, 3300, 2, null, false, false),
  ('c60aff6b-61d7-4df2-a45d-38be77b63533', 'Latex Car Mat City-18 3p', 2950, 2950, 2, null, false, false),
  ('c0be26d8-54a0-46eb-a4c5-a07bf81e7df7', 'Latex Car Mat City-22 3p', 3100, 3100, 2, null, false, false),
  ('4d3d5c86-2698-495b-b761-a06008ee39f8', 'Latex Car Mat Civic-19 3p', 2950, 2950, 2, null, false, false),
  ('d65f1acd-bf3c-4dee-85d7-e17fab6d5230', 'Latex Car Mat Corolla 3p', 2600, 2600, 2, null, false, false),
  ('5b9c6f67-4a58-4162-8fc9-feb37034d96d', 'Latex Car Mat Yaris 3p', 3000, 3000, 2, null, false, false),
  ('9e7851fa-4916-4ae4-bf17-ab9dae286fae', 'Latex Car Mat Vitz -17 3p', 3200, 3200, 2, null, false, false),
  ('6616d761-22e6-45ad-a57d-31d2fdecdd84', 'Latex Car Mat Sportage 3p', 3800, 3800, 2, null, false, false),
  ('71022af9-7779-4fb0-be6b-b0dda736dbde', 'Nasa Break Cleaner 450ml', 425, 425, 24, null, false, false),
  ('1a937eab-b5ec-45e8-877c-6da48142f5f1', 'Nasa Carb Cleaner 300ml', 275, 275, 48, null, false, false),
  ('98bbfa53-e382-43f7-a3a6-95b5d91b417d', 'Nasa Break Fluid 200ml', 185, 185, 24, null, false, false),
  ('1409540b-a201-49ec-a3a2-b5a3b927fe72', 'Nasa collant Green 1L', 535, 535, 12, null, false, false),
  ('d6360a19-5852-46e7-827f-4da4132def0e', 'Nasa Powrstring Oil 355ml', 418, 418, 24, null, false, false),
  ('ec1555b9-0217-4755-82b8-0e74f5609e1a', 'Nasa ATF 1L', 815, 815, 12, null, false, false),
  ('12384595-64ff-411d-8ce0-1fe398502cd9', 'Nasa Gear Oil 85W140 1L', 830, 830, 12, null, false, false),
  ('4e468ab4-12b9-4865-9679-e6c38fc9f7d1', 'Nasa Glass Cleaner 500ml', 311, 311, 12, null, false, false),
  ('6ddd0fea-7464-43df-8d9e-f5f531891c1e', 'Nasa Car Shampoo 500ml', 330, 330, 12, null, false, false),
  ('bb4ac676-03f6-4731-8e5a-e41eb69bdf85', 'Nasa Lethr Protctnt 200ml', 340, 340, 24, null, false, false),
  ('d67bdbca-7754-46a7-8d26-793c66d8659e', 'Nasa Tyre Restores 500ml', 495, 495, 12, null, false, false),
  ('d2cc034e-5075-4eb8-bbfd-bade76c91b3e', 'Yokohama 185/65R15', 20500, 20500, 8, null, false, false),
  ('b47063dd-2f40-4328-95ac-6fbb7be7f41f', 'Xp 230 Phoenix 23p', 27489, 27489, 4, null, false, false),
  ('08e534bc-9ed8-40ba-9229-18251b86685a', 'Xp100 phoenix 11p', 12274.5, 12274.5, 4, null, false, false),
  ('bd4bde12-247f-44d0-8177-bc6e3f582149', 'HT Solar50 Osaka 5p', 4499.25, 4499.25, 5, null, false, false),
  ('07cbfd99-1b3a-4d13-befb-94c0f21726fa', 'N110 Exide', 15735.2, 15735.2, 3, null, false, false),
  ('a148e9c0-b2dd-44a7-9489-e3555d363ff2', 'HT1800 osaka Tubular', 34790, 34790, 4, null, false, false),
  ('060411ab-df39-4792-aa38-1d2393e86532', 'Tx1800 phoenix Tubular', 36723.6, 36723.6, 1, null, false, false),
  ('22b0ad91-cf9a-4bf4-bd15-089f637654a6', 'HT1000 Osaka', 15000, 15000, 5, null, false, false),
  ('69fbecc0-c77c-47a3-906f-f6bf36b8af09', 'N180 Exide 21p', 24294.2, 24294.2, 5, null, false, false),
  ('fd30a827-ddb0-4e39-bce9-d7736b067433', 'HP200 exide 21p', 24892, 24892, 2, null, false, false),
  ('3968f986-1d81-4e3b-937d-3d9454a245a2', 'HP230 Exide 23p', 29988, 29988, 1, null, false, false),
  ('4bb7ba49-961e-4da6-beaa-edb9fceb1c7a', 'CN60 Exide 9p', 7840, 7840, 5, null, false, false),
  ('4a731dfb-7bc1-4c42-a26c-fbeb4402a16d', '6x130 Eixde 15p', 17346, 17346, 2, null, false, false),
  ('ae15e1b1-0d9b-4a13-9411-4b33a500e57b', 'HT115 Osaka 11p', 12201, 12201, 9, null, false, false),
  ('2a2b40b4-a3fb-498a-9dc1-e9f59624f4b2', 'HT160 Osaka 19p', 20834.8, 20834.8, 7, null, false, false),
  ('3449e9b4-2dae-499b-b27d-65d2a63710e6', 'HT200 Osaka 21p', 23030, 23030, 9, null, false, false),
  ('a0f006b5-97ed-468d-aed4-f1a85287ff9e', 'HT60 osaka 9p', 7217.7, 7217.7, 6, null, false, false),
  ('a9dff78c-161e-4ed7-92b4-c5c548b882bb', 'HT70 Osaka 11p', 8962.1, 8962.1, 4, null, false, false),
  ('58b5b33b-5ed8-417b-8b3f-944b75dc486b', 'TX1800 Phoenix Tubular', 36723.6, 36723.6, 2, null, false, false),
  ('2c812001-bcb3-46ec-bc80-96011461b9dd', 'XP200 phoenix 21p', 24300.6, 24300.6, 2, null, false, false),
  ('83e63de6-82ff-4bf1-865d-a4207d1fc215', 'EXT135 Phoenix 15p', 17574, 17574, 2, null, false, false),
  ('a5c0aa1e-b1e2-4567-94e6-feb8ad733629', 'UGS210 phoenix 21p', 25795.4, 25795.4, 2, null, false, false),
  ('5bd6af80-5594-4d21-8e56-1eae733b5cd3', 'XP60 phoenix', 7635.6, 7635.6, 5, null, false, false),
  ('e71527f5-e729-441a-bbff-3e8361ce607c', 'Bridgestone 205R14', 40000, 40000, 10, null, false, false),
  ('3513ecef-0aea-4d68-b1a6-1b5a11fb0f1d', 'GreatStone 185R14', 14250, 14250, 10, null, false, false),
  ('59da13a3-4dfe-4c37-bd46-570a8807e3f1', 'GreatStone 195R14', 16500, 16500, 6, null, false, false),
  ('f401475c-e51a-4142-bceb-5e93732a6edf', 'Bridgestone 205R14', 40000, 40000, 10, null, false, false),
  ('7036e353-48a4-4278-9d1c-e8cde8648ef8', 'GreatStone 185R14', 14250, 14250, 10, null, false, false),
  ('063ac10d-6c69-466d-b245-201cd13d2dfb', 'GreatStone 195R14', 16500, 16500, 6, null, false, false),
  ('a9aa1f70-48ba-4cfb-841e-a70c09ba18b6', 'Sp Tall 2000 Tubular', 43139.29, 43139.29, 4, null, false, false),
  ('fb18b35b-5182-4e9f-b585-700be104161a', 'Sp Tall 1800 Tubular', 36212.5, 36212.5, 2, null, false, false),
  ('3836dcf9-eaa1-4efc-a381-7079f136c713', 'Sp Tall 1200 Tubular', 28330.28, 28330.28, 2, null, false, false),
  ('9e32debb-ea75-4a3b-92c6-ae85ddd45035', 'Ws45 AGS 5p', 5758.53, 5758.53, 10, null, false, false),
  ('0a997b63-3bfe-41aa-be8c-00212fd176ef', 'Ws135 AGS 15p', 20381.78, 20381.78, 5, null, false, false),
  ('60de04f8-bfce-4bf4-8fb3-e222f817c43d', 'Gx165 AGS 21p', 27229.5, 27229.5, 3, null, false, false),
  ('af4ae81c-34e2-4dce-a7d6-57d92e7720ec', 'Gl65 AGS 13p', 11849.88, 11849.88, 5, null, false, false),
  ('26638fca-b4a4-4a20-b329-c8ef9396b41c', 'Sp70 AGS 11p mini', 9792.53, 9792.53, 10, null, false, false),
  ('15797e12-e0c2-4374-8a4f-71970afc5856', 'Ws195 AGS 21p', 27491.71, 27491.71, 7, null, false, false),
  ('7cb927ac-4ee0-4611-9d00-97bf2e1131a0', 'MF50 AGS 9p', 9595.74, 9595.74, 10, null, false, false),
  ('abaf3ad8-db03-4276-b4d2-ea0105f5a7ef', 'MF60 AGS 11p mini', 10748.48, 10748.48, 10, null, false, false),
  ('0a5f6cce-943d-4c1b-aecd-2d0ec1715f1c', 'MF70 AGS 13p', 12617.77, 12617.77, 10, null, false, false),
  ('ade5a585-b315-4eb0-b5f6-c0a36a99d396', 'Sp50 AGS 9p', 8249.53, 8249.53, 10, null, false, false),
  ('b4936961-d0eb-4a6e-9f4a-0756e6228555', 'MF100 AGS 15p', 20157.28, 20157.28, 1, null, false, false),
  ('0a34cf6d-3cbc-4003-8a75-cd09d97b2575', 'Sp130 AGS 15p', 20230.51, 20230.51, 2, null, false, false),
  ('b7b94c9a-0fe8-4af4-9db9-ba75726c65f2', 'Sp140 AGS 17p', 21591.99, 21591.99, 2, null, false, false),
  ('0cdc063e-5932-4aa1-8943-c25dab7b2430', 'MF90 AGS 13p', 17654.5, 17654.5, 1, null, false, false),
  ('926d4538-5da2-44b6-bd21-768e2f84de9c', 'MF Din65 AGS 14p', 18391.83, 18391.83, 2, null, false, false),
  ('bf0b20a0-c6b0-4c4f-ac97-09a42cae3531', 'Sp150 AGS 19p', 24234.26, 24234.26, 4, null, false, false),
  ('00878d62-e7c9-47fd-bc86-4379b71bbfb4', 'Ws165 AGS 19p', 24435.96, 24435.96, 4, null, false, false),
  ('81b8d90e-193e-4bc1-81b2-2cb4fda8cf5d', 'Gx135 AGS 19p', 24093.06, 24093.06, 2, null, false, false),
  ('053a8dc9-ea5f-48a7-a00d-ab94e553005a', 'Rovelo 145/70R12', 7700, 7700, 6, null, false, false),
  ('87684a6f-edb8-42b2-8bd5-282a9b456a22', 'Kumho 195/60R17', 28000, 28000, 4, null, false, false),
  ('8e955d08-88c1-442b-8207-241c0efde94f', 'Sp Tall 1800 Tubular AGS', 36212.5, 36212.5, 3, null, false, false),
  ('b94e1113-cfac-4f6d-ac82-a00dcece7b74', 'HT 135 Osaka 15p', 17052, 17052, 10, null, false, false),
  ('07f06636-83fd-4597-a25f-fb5a44b9fca4', 'HT 200 osaka 21p', 23030, 23030, 15, null, false, false),
  ('a5b8e5ff-0286-4445-8ca6-2d1a760cd37e', 'HT 230 osaka 23p', 26950, 26950, 5, null, false, false),
  ('7a47da6c-ad35-4aaf-a061-5072ca49276c', 'HT 160 osaka 19p', 20834.8, 20834.8, 10, null, false, false),
  ('3a4b80d1-6c6c-4dcf-ad2a-82e6a5adf528', 'HT 60 osaka 9p', 7217.7, 7217.7, 5, null, false, false),
  ('6a2999a3-0241-47ad-8d5d-2f7fc2d90f3b', 'MF70 osaka 11p', 10192, 10192, 2, null, false, false),
  ('b954db7d-f5a4-409c-bc1c-c955ba6d8d97', 'HT 125 Osaka 15p mini', 15332.1, 15332.1, 3, null, false, false),
  ('4283e657-cb11-40fa-a2ee-6b0249d2cdc8', 'XP 200 Phoenix 21p', 24541.2, 24541.2, 2, null, false, false),
  ('c27b150b-218b-4ce0-8da5-b9b9ca608b41', 'EXT 140 Phoenix 17p', 19247.4, 19247.4, 2, null, false, false),
  ('197dfb0c-c800-4f29-9480-6c317c077bab', 'HP230 Exide 21p', 30198, 30198, 1, null, false, false),
  ('e0a74211-bf17-44df-9119-e0de840f7c53', 'Michelin 215/75R14', 40000, 82000, 13, null, false, false),
  ('10f7e6cd-1ca4-4a8a-bba2-190c88566e23', 'Rim cover Double clr 15”', 2500, 2500, 2, null, false, false),
  ('7e17db37-8066-4642-8874-669834f0577e', 'Rim Cover Double clr 14”', 2200, 2200, 4, null, false, false),
  ('5bb34512-1a40-4339-8dcf-57b28a8bf681', 'Rim cover chrome 14”', 1850, 1850, 2, null, false, false),
  ('525cd8ea-e6cb-4cd7-83b2-374be49897fc', 'Rim Cover silver 13”', 1200, 1200, 3, null, false, false),
  ('d3fb1d21-c005-4bef-ab0b-31cd15303b57', 'Rim Cover silver 14”', 1250, 1250, 2, null, false, false),
  ('6b21e3c1-fc97-422b-b01e-15543c05bd7a', 'Rim Cover Silver 14”', 1200, 1200, 2, null, false, false),
  ('5eb60df7-363a-4782-899b-2b81ac2c714b', 'Linglong 155/70R12 WL', 8640, 8640, 8, null, false, false),
  ('f66093b3-a476-452b-86b3-49dd5e08c1a8', 'Ovation 225/55R19', 25000, 25000, 4, null, false, false),
  ('5c50bf4f-a7ad-4666-8d05-43c12b37ad16', 'Ovation 225/45R18', 20000, 20000, 4, null, false, false),
  ('13344f5e-9ef0-44b6-bcdb-2a89419a2859', 'Evergreen 185R14', 18300, 18300, 23, null, false, false),
  ('4a343d03-28b8-4b39-a30c-973fcad47248', 'Evergreen 205R14C 10pr', 23200, 23200, 12, null, false, false),
  ('19e033bd-49c6-4b1d-9c09-dddb37e144b6', 'Sunfull 185/65R15', 12800, 12800, 1, null, false, false),
  ('cc12cbc2-3210-4487-9c73-e2c7b226c66a', 'Sunfull 165/65R14', 10000, 10000, 12, null, false, false),
  ('604c7ae5-4c20-47de-8bd8-7e0c965fc4f5', 'MF50 AGS 9p', 9595.74, 9595.74, 10, null, false, false),
  ('b2372e8b-e0a8-426d-b3f5-7cceba3f8939', 'MF60 AGS 11p mini', 10748.48, 10748.48, 10, null, false, false),
  ('840bc5a8-a2af-409e-b427-d75244eea2ce', 'MF100 AGS 15p', 20157.28, 20157.28, 2, null, false, false),
  ('e4f26de2-1608-44ef-9b78-f7b4f52f3eed', 'MF90 AGS 13p', 17654.5, 17654.5, 2, null, false, false),
  ('77759210-2756-41b8-a055-cd03b3745565', 'Sp180 AGS 21p', 27100, 27100, 7, null, false, false),
  ('c0282cfb-818f-4c65-b0ba-2d582346d204', 'Ws195 AGS 21p', 27260, 27260, 7, null, false, false),
  ('88373e00-d0d2-43c0-9e7e-0ed2780b2e77', 'Ws165 AGS 19p', 24230, 24230, 7, null, false, false),
  ('4b03e3ed-cc40-4e5b-965d-fd3f3c81427c', 'Ws45 AGS 5p', 5710, 5710, 10, null, false, false),
  ('e5e6f749-80b6-4dd9-8c6d-27155a355dee', 'Ws50 AGS 7p', 7080, 7080, 10, null, false, false),
  ('ca01a8aa-944c-4c1e-89b7-89b70a7a817b', 'Sp50 AGS 9p', 8180, 8180, 10, null, false, false),
  ('c5ff6512-9a7f-474b-938d-d2ca35c47d49', 'Ws135 AGS 15p', 20210, 20210, 2, null, false, false),
  ('c38d4ce3-b0f4-4bd5-85e3-1f803dcbbef7', 'Sp100 AGS 11p', 13710, 13710, 10, null, false, false),
  ('b4cdbbef-09bb-4598-a7f4-34f934f17096', 'GL100 AGS 15p', 17140, 17140, 2, null, false, false),
  ('965649a4-5f66-429f-ae55-868369b7e5bf', 'GR100 AGS 15p', 17140, 17140, 2, null, false, false),
  ('f95a3c56-104d-4dde-96b7-083a7f33fb41', 'Ws230 AGS 23p', 34120, 34120, 4, null, false, false),
  ('bc45a941-10e0-4164-b149-de3789236393', 'Sp140 AGS 17p', 21410, 21410, 2, null, false, false),
  ('f81315e6-6000-4c41-a46f-9b31dff895dc', 'Sp Tubular 1200', 28330.28, 28330.28, 4, null, false, false),
  ('67c92c9e-062c-4982-a939-3ab980bd5d7a', 'N 125 AGS 17p', 21320, 21320, 3, null, false, false),
  ('d8d2a03b-1a31-45a8-96ce-649544632f44', 'Sp70 AGS 11p mini', 9710, 9710, 7, null, false, false),
  ('28e127ce-8972-4344-bc9e-2563700c22b9', 'Sp60 AGS 9p', 9310, 9310, 6, null, false, false),
  ('7f714219-f456-4cb9-845a-395ed5dbcb97', 'Ws150 AGS 17p', 21610, 21610, 3, null, false, false),
  ('b6827894-fe19-4a10-b953-ba9eb6f875fa', 'N240 Exide 27p', 32970, 32970, 2, null, false, false),
  ('a606368e-29db-48c1-b9e1-58e515df29af', 'General 145/80R13', 10100, 10100, 5, null, false, false),
  ('62606cd1-bc75-4ccc-85a9-2763b0b95145', 'General 145/70R12', 8400, 8400, 4, null, false, false),
  ('a7e63e96-20fe-4ff9-aac0-821132d92f09', 'General 165/65R14', 12200, 12200, 4, null, false, false),
  ('3bde9d58-f564-4804-9cd5-74d959e1d18c', 'Super king 500-12 16PR', 7800, 7800, 12, null, false, false),
  ('95de4395-3144-42ca-b688-f7e172f940ba', 'N240 Exide 27p', 32970, 32970, 2, null, false, false),
  ('35686fdb-f208-4ae1-af83-eafc5d51dde1', 'Yokohama 265/65R17', 51000, 51000, 4, null, false, false),
  ('427980e2-6cb3-4080-910d-350b29f0dfa9', 'Hp230 Exide 21p', 29376, 29376, 2, null, false, false),
  ('7649706f-ad09-4c27-aa28-5eab6f4a4b24', 'Xp200 phoenix 21p', 24300.6, 24300.6, 2, null, false, false),
  ('3b64e1f5-f2b9-4948-86e9-5be87ebca8d8', 'Ext135 phoenix 15p', 17574, 17574, 1, null, false, false),
  ('97032fcb-c768-4f08-a7af-6fa4606d8bbe', 'Xp230 phoenix 23p', 28128.5, 28128.5, 1, null, false, false),
  ('55a22c54-52e5-42d1-b7bc-304ff2bfa139', 'UGS160 phoenix 17p', 20856.5, 20856.5, 1, null, false, false),
  ('4201addf-01ce-4d20-bb86-d79c8575fbcf', 'HT145 Osaka 17p', 18096, 18096, 2, null, false, false),
  ('76c73fd2-6bb0-4543-a410-471bf34f8e60', 'HT200 osaka 21p', 22560, 22560, 10, null, false, false),
  ('32bd1062-5e31-48c1-b160-694065e53f7e', 'HT270 osaka 27p', 31872, 31872, 2, null, false, false),
  ('2b4fb7b4-b13b-45c6-ab25-78835b18bd30', 'HT115 osaka 11p', 11616, 11616, 5, null, false, false),
  ('39c929cb-77d5-4932-a562-a6129b6ff2d8', 'HT1000 osaka 11p tubular', 15000, 15000, 10, null, false, false),
  ('3bb3cb57-be62-4122-a1d5-d3a2db95ec6c', 'HT solar50 osaka 5p', 4473.6, 4473.6, 6, null, false, false),
  ('ca75ac23-e887-4535-886f-8473fc53ff66', 'HT1800 osaka tubular', 34080, 34080, 3, null, false, false),
  ('f3a4bde3-0881-418f-bbc8-f546963a20e0', 'Triangle 185R14', 16500, 16500, 6, null, false, false),
  ('72d76e18-f21f-4662-8af4-3756ba1ed227', 'Triangle 195R14', 18500, 18500, 6, null, false, false),
  ('da03e734-41ae-402a-8196-c9eb6b6b696d', '600-16 Tube Diamond', 840, 840, 25, null, false, false),
  ('16503174-2cfb-4f64-a860-6fd47b50d48b', '500-12 Tube Diamond', 660, 800, 49, null, false, false),
  ('7586ca83-f521-468d-bcde-c4a17f697533', 'Diamond 450-12 10PR', 5750, 5750, 5, null, false, false),
  ('76022ac5-0f87-4088-a3e1-35dcad5ad77c', 'Road power 135-10 14ply', 4850, 4850, 10, null, false, false),
  ('6228db08-05ee-4bd5-b051-fbd9fa210afd', 'Triangle 185R14', 16500, 16500, 6, null, false, false),
  ('e87dcfa3-9a44-418c-9e32-84d327b9882e', 'Triangle 195R14', 18500, 18500, 6, null, false, false),
  ('9cdd36b3-46bd-4830-bc13-500db12a0e0c', '600-16 Tube Diamond', 840, 840, 25, null, false, false),
  ('f7a1b0cd-ef4a-4936-a29d-56f03e143a15', '500-12 Tube Diamond', 660, 660, 50, null, false, false),
  ('18decf41-be1f-474b-a00e-f58a1e80cb36', 'Diamond 450-12 10PR', 5750, 5750, 5, null, false, false),
  ('9c70678e-8f64-4b98-875e-f95ae4b45854', 'Road power 135-10 14ply', 4850, 4850, 10, null, false, false),
  ('6d890493-ef44-46a5-b6f2-f24b845f903b', '195/65R15 Sunfull', 13500, 13500, 20, null, false, false),
  ('14b22c95-4d77-4f7f-9d78-56a298de70fb', '145R12 Evergreen', 9600, 9600, 12, null, false, false),
  ('adb54e39-d960-4b3b-a846-0d9884253c47', '185R14 Evergreen', 18300, 18300, 30, null, false, false),
  ('9e7a6488-0789-449b-b3ad-e5128b272eab', '195R14 Evergreen', 20600, 20600, 12, null, false, false),
  ('3f1ed580-9a68-41c7-906e-bae3fb348c51', 'Sp50 AGS 9p', 8180, 8180, 20, null, false, false),
  ('c64e862c-31e9-4ed9-b7f2-4dba438d3331', 'Tall 1200 AGS', 28371.2, 28371.2, 4, null, false, false),
  ('3fecabe4-2640-4f0b-9f41-16c316bcfd23', 'Tall 1200 AGS', 28371.2, 28371.2, 4, null, false, false),
  ('93760dbf-5458-4aa2-b7be-d9e4ab20cb02', 'Ws220 AGS 23p mini', 29260, 29260, 2, null, false, false),
  ('87dc1e9a-a884-469d-a225-4d85fd691bc8', 'Sp50 AGS 9p', 8180, 8180, 20, null, false, false),
  ('89205643-85a2-4d79-9d50-0e7ea6663a97', 'Tall 1200 AGS', 28371.2, 28371.2, 4, null, false, false),
  ('9110cfff-ecb0-4ef7-bcd6-a628330fa81d', 'Tall 1200 AGS', 28371.2, 28371.2, 4, null, false, false),
  ('0c68da21-c4b8-4248-8c65-d2ea4e10db9d', 'Ws220 AGS 23p mini', 29260, 29260, 2, null, false, false),
  ('bbf408c6-c9b9-4bae-a38b-85866e61a65b', 'HT2500 osaka Tubular', 43002.08, 43002.08, 1, null, false, false),
  ('2608c571-603c-4b21-922e-7372a565198e', 'HT1800 Osaka Tubular', 33198.54, 33198.54, 4, null, false, false),
  ('b32c2d95-320f-4e94-a059-7e47155f0164', 'Michelin 215/75R14', 41000, 41000, 2, null, false, false),
  ('3b4a67a4-113e-4845-ad25-f5878a87988f', 'Ws220 AGS 23p mini', 29260, 29260, 4, null, false, false),
  ('545bb905-2000-43c9-b90d-88799a5b9a0a', '225/55R18 Ovation', 20000, 20000, 4, null, false, false),
  ('49ed3a45-fa98-4208-bdcb-3b5742ee3bfb', '205/60R16 Ovation', 16000, 16000, 4, null, false, false),
  ('f1a8fb87-defe-41a0-b7f7-d28fb8fcee72', '215/75R14 Michelin', 39200, 39200, 6, null, false, false),
  ('6b4e61cf-3336-4c4f-86c8-7775bbaad86a', '175/70R13 Ovation', 9800, 9800, 4, null, false, false),
  ('8baa8cee-cb56-41cb-84b4-ba5275f147e3', 'Nasa Super Collant 1L', 535, 535, 12, null, false, false),
  ('331f1693-fd53-4e4b-b154-47bb04f6eed2', 'Armstrong 165/70R13', 9955, 9955, 12, null, false, false),
  ('f27cba38-ae32-4fb9-a1b2-426752cbba8a', 'Armstrong 175/70R13', 10590, 10590, 8, null, false, false),
  ('4d0720d8-4aa3-4049-adb3-5f2e8e8bac9f', 'Armstrong 165/65R14', 10900, 10900, 8, null, false, false),
  ('7934e82f-0f95-4815-b4f7-7a9c082a6a02', 'Armstrong 185/60R15', 13860, 13860, 4, null, false, false),
  ('295ad389-5368-4814-8518-2a596d6395b4', 'Armstrong 185/65R15', 13750, 13750, 8, null, false, false),
  ('263b1ffa-68af-40bd-8a08-842c1ce0e9c1', 'Armstrong 195/65R15', 14190, 14190, 12, null, false, false),
  ('ef58d318-7b78-4f6e-a202-ac9db9e4fbb5', '6.50R14 Double Coin', 32000, 32000, 1, null, false, false),
  ('8263b9b3-433e-4d1e-813a-f6e27af84e12', '6.50R14 Magnum', 28000, 28000, 4, null, false, false),
  ('17b3c7a2-590a-4447-9b46-df17b216a6f3', '6.50R14 Magnum', 28000, 28000, 2, null, false, false),
  ('8155e693-c6cf-4145-a01b-9d67bd059ef5', '600-16 Chengshen', 15500, 15500, 1, null, false, false),
  ('5948bb65-a96f-4a0a-a4cd-fe2ad2bdd8a7', 'HT 1800 Osaka', 37800, 37800, 10, null, false, false),
  ('0dbc48f1-1613-4e83-af4e-7b12d0d95c09', 'HT200 Osaka 21p', 25462.5, 25462.5, 20, null, false, false),
  ('86187ebf-3e86-49bc-853b-ae86c892d537', 'HT160 Osaka 19p', 22575, 22575, 10, null, false, false),
  ('598a367e-9510-4799-9f1e-f281063f7855', 'HT230 Osaka 23p', 29767.5, 29767.5, 10, null, false, false),
  ('2fce32da-c71b-46c1-a69e-930622586186', 'HT270 Osaka 27p', 35385, 35385, 4, null, false, false),
  ('16a28d66-b6d1-4485-9698-18d928bdfc26', 'HT115 Osaka 11p', 13755, 13755, 5, null, false, false),
  ('e660a00f-3e03-47ad-a473-a7170622e948', 'HT60 osaka 9p', 7749, 7749, 10, null, false, false),
  ('4ae2d697-d0a4-466a-9b18-467b3a384316', '145/70R12 Rovelo', 7600, 7600, 20, null, false, false),
  ('f9296ab7-8b55-4f38-8bea-a2e04665d6f3', 'Rim 13" Alto Simple', 2625, 2625, 8, null, false, false),
  ('b3311fe9-386d-4582-adea-53208119efbe', 'DSS140 Daewoo 17p', 19834, 19834, 5, null, false, false),
  ('f5107e9b-183a-4a07-886a-da3618156a9b', 'DSS220 Daewoo 23p mini', 31650, 31650, 5, null, false, false),
  ('8969685c-66e1-47c5-aa14-a3e58a367d7b', 'DL55 Daewoo', 9000, 9000, 10, null, false, false),
  ('40d2c8dd-dcbc-4ffe-803c-ec2a054218c5', 'DL60 Daewoo', 10150, 10150, 10, null, false, false),
  ('c8eda9c3-a557-4b57-adc2-18a0591ce0a6', 'DLS65 Daewoo', 11500, 11500, 5, null, false, false),
  ('745a7d48-dbdf-4913-975a-f9ee58d84e9b', 'DLS70 Daewoo', 12000, 12000, 5, null, false, false),
  ('919bcaaa-6592-4836-a07e-bac74d23b05a', 'DSS100 Daewoo', 12376, 12376, 6, null, false, false),
  ('c13f90ad-5390-47fc-b01f-0f64dd46ab6d', 'DSS120 Daewoo', 17724, 17724, 5, null, false, false),
  ('85285207-973e-48c0-927e-1e511a98e3f5', 'Agri125 Daewoo', 22500, 22500, 5, null, false, false),
  ('bb3f66aa-6211-4724-b2e2-82b9a40b386b', 'DIB135 Daewoo', 21627.5, 21627.5, 6, null, false, false),
  ('b8fdd5fe-85ef-44a9-ac80-47583f392830', 'DIB135 Daewoo', 21627.5, 21627.5, 6, null, false, false),
  ('9e0f6268-1efc-45d5-83d5-74bd6dc1e142', 'DIB110 Daewoo', 19517.5, 19517.5, 5, null, false, false),
  ('4d1e494b-0e3a-4492-bcd8-72659172490c', '185/70R13 Goform', 12000, 12000, 4, null, false, false),
  ('95c814ba-0c59-4bae-89d3-722a2f80912a', '155/70R12 Agate', 7900, 7900, 4, null, false, false),
  ('9710c7a2-af38-4420-96a3-3d6e8b539779', '650-14 Panther 10ply', 17900, 17900, 2, null, false, false),
  ('9829e0fb-8e46-4583-a75c-8c144166f79c', '155/70R12 Tracmax W.L', 8200, 8200, 4, null, false, false),
  ('23f05eac-7f6d-4c31-9bdb-8949ee506c14', '650-14 Panther 10ply', 18100, 18100, 10, null, false, false),
  ('f263e4c5-b8e4-4451-bfe0-b6a28f5ef035', '500-12 Panther 14ply', 6950, 6950, 10, null, false, false),
  ('022b69ac-d1c4-43bf-bed2-bd7d1bcbd3d4', '600-16 Panther 6ply', 8900, 8900, 4, null, false, false),
  ('12997f6b-87a2-4b15-a838-a1ddb9a9a943', '600-16 Panther 8py', 10100, 10100, 4, null, false, false),
  ('65b4d066-a2b4-4019-85df-10898e913749', '195R14 Triangle', 18500, 18500, 6, null, false, false),
  ('1464790a-d503-471f-b5ca-111c3ea01ab6', '185R14 Triangle', 16500, 16500, 6, null, false, false),
  ('c9c81355-a3da-4c1e-a127-f36eb2725283', '195R15 Sunny', 19500, 19500, 10, null, false, false),
  ('a546bc43-9922-46c4-96c6-7c01022375fa', 'HT200 Osaka', 25462.5, 25462.5, 10, null, false, false),
  ('37ac0e18-be52-4abb-9b1f-cf04a6c76d76', 'HT115 Osaka 11p', 13755, 13755, 10, null, false, false),
  ('9da0b290-3610-4405-a42e-4903289070f3', 'HT145 Osaka 17p', 20317.5, 20317.5, 5, null, false, false),
  ('601f6001-24c9-4fcc-94a9-caef0d01effd', '185R14 Evergreen', 18300, 18300, 50, null, false, false),
  ('5c579c93-68de-4556-b31e-fcf43cb2f917', '195R14 Sunfull', 17500, 17500, 12, null, false, false),
  ('9f892823-0005-4421-aec9-a116f8db2ab7', 'Tall 1800 AGS Tubular', 36613.5, 36613.5, 2, null, false, false),
  ('73b6077a-d6c3-4857-b28b-60283eee95d8', '195R15 Evergreen', 22300, 22300, 14, null, false, false),
  ('5c96f9f1-637a-4e87-a95f-df74934be8d2', '165/70R13 Sunfull', 10000, 10000, 6, null, false, false),
  ('c0222f57-cede-45ba-b6a9-dfaadb8434ce', 'DIB 165 Daewoo 21p', 29256, 29256, 22, null, false, false),
  ('da2c837e-5093-456e-ba8f-0d1a8e758cb3', 'DSS190 Daewoo 21p', 26606, 26606, 15, null, false, false),
  ('70337855-90eb-4dec-bd02-34d7b9391068', 'DL55 Daewoo 9p', 9000, 9000, 5, null, false, false),
  ('225467a0-1b90-49cc-964d-8453a7115058', 'DSS100 Daewoo 11p', 12376, 12376, 6, null, false, false),
  ('998b3c1d-39c9-448d-8b9c-a26ab06ca19e', 'Ws230 AGS 23p', 34461.2, 34461.2, 2, null, false, false),
  ('ed24f7e3-6c58-4c73-9c0d-81e80a4a5754', '165/65R14 Zmax', 10000, 10000, 8, null, false, false),
  ('4993e3f3-4b6e-455c-8e35-5824852f9e3a', '165/70R13 Zmax', 10000, 10000, 8, null, false, false),
  ('5356a69c-fa43-4999-884e-3193556770d3', 'Tx1800 phoenix tubular', 40984, 40984, 10, null, false, false),
  ('b65409e9-fa25-4172-b4b2-4789eee1feae', 'Xp165 phoenix 19p', 23347.8, 23347.8, 5, null, false, false),
  ('8f195b81-ab8d-4e39-84fa-babdd1dda395', 'Xp100 phoenix 11p', 14333.5, 14333.5, 5, null, false, false),
  ('fe78011d-ea9e-4397-9ba7-45a40fb71cfa', 'Xp200 phoenix 21p', 26879.4, 26879.4, 15, null, false, false),
  ('b6df8bf1-e1f0-48b0-b04c-8c6eadd48728', 'UGS210 phoenix 21p', 27740.5, 27740.5, 5, null, false, false),
  ('4b4cb195-a0ad-4ca3-9762-331c9aec9a7a', 'Xp220 phoenix 23p mini', 28263.7, 28263.7, 5, null, false, false),
  ('19be90ab-01be-44d7-9579-186520975363', 'Xp230 phoenix 23p', 30814.3, 30814.3, 5, null, false, false),
  ('8b23d8d5-2846-4ab0-af30-ce92071e2563', 'UGS235 phoenix 23p', 31043.2, 31043.2, 5, null, false, false),
  ('7b9500ff-3469-4a35-9dbf-e165ff9245c7', 'Xp100 phoenix 11p', 14333.5, 14333.5, 6, null, false, false),
  ('dab45850-cf30-42e7-b8fb-6a441b4c91a4', 'EXT135 phoenix 15p', 17211.1, 17211.1, 10, null, false, false),
  ('c5034efb-62d4-4969-bb99-6e8afff0265b', 'Xp200 Phoenix 21p', 26879.4, 26879.4, 5, null, false, false),
  ('220e42e7-f08f-425c-a947-143bfd58ad10', 'UGS235 phoenix 23p', 31043.2, 31043.2, 2, null, false, false),
  ('3bd5d632-4725-4b74-b02c-e10e1e2edb30', 'Tx1800 phoenix Tubular', 40984, 40984, 4, null, false, false),
  ('b762d787-6016-4548-86a0-599d0e2848d9', '145R12 General', 8800, 8800, 4, null, false, false),
  ('c537a768-43ae-4d88-ae9a-289472e7955b', '145/80R13 General', 10800, 10800, 5, null, false, false),
  ('0bf930cd-b528-4d02-baa9-663fd39a4ba3', '165/65R14 General', 12500, 12500, 4, null, false, false),
  ('51b0a732-ffdf-45ba-9ad9-16e6941d5777', 'Rate frk ws230 ags', 1364, 1364, 1, null, false, false),
  ('0691aa51-b4c7-407c-84d5-1078a818f8f2', 'Sp250 AGS 27p', 38892.8, 38892.8, 2, null, false, false),
  ('4362be53-75ba-4e2b-b58c-9aa7e88fde61', 'Tall 1800 AGS', 37310.9, 37310.9, 1, null, false, false),
  ('4771bc7d-85ec-4440-be28-2c13ba034392', 'Sp195 AGS 23p mini', 29942.1, 29942.1, 6, null, false, false),
  ('118a1aa0-8493-4d5e-8c59-95fedb59841d', 'Sp180 Ags 21p', 27913, 27913, 4, null, false, false),
  ('9923f8f3-b5f7-4269-9a82-03263c4f4616', 'Gx175 AGS 23p mini', 29880.3, 29880.3, 6, null, false, false),
  ('cd3c839b-661f-4e2d-9db3-b51afdc84982', 'Gx165 AGS 21p', 27810, 27810, 4, null, false, false),
  ('6edc46ab-696e-4633-aafa-30b0ca1708fa', 'Ws195 AGS 21p', 28077.8, 28077.8, 4, null, false, false),
  ('eee22968-4f91-4592-9ac0-ad7377865171', 'Sp140 AGS 17p', 22052.3, 22052.3, 2, null, false, false),
  ('8fce8e8f-a798-4c3a-a7ec-c2df77845559', 'Gx135 AGS 19p', 24606.7, 24606.7, 6, null, false, false),
  ('6f3f701d-2763-4770-94b1-6ec653c381d9', 'Sp250 AGS 27p', 39648, 39648, 2, null, false, false),
  ('144e27a8-16f9-4365-aff6-47bc990e9c0d', '165/70R13 Armstrong', 9656.35, 9656.35, 20, null, false, false),
  ('a389351d-0eb9-4680-971e-f4a8c06ae8ee', '165/65R14 Armstrong', 10573, 10573, 20, null, false, false),
  ('92ae665b-6ad6-4079-9fdb-c82fc4e51ce1', '175/70R13 Armstrong', 10272.3, 10272.3, 4, null, false, false),
  ('552c2a76-7b80-48f8-8745-3e73b0222cda', '205/55R16 Armstrong', 16005, 16005, 4, null, false, false),
  ('bb8a43a0-3b5c-45f3-b44b-57226c2e713d', '185/65R15 Armstrong', 13337.5, 13337.5, 4, null, false, false),
  ('4c25935b-88ef-4c1d-b53e-c06b512e20e6', '195R15 Armstrong', 19569.75, 19569.75, 4, null, false, false),
  ('5c95bfaa-5f9d-490c-8369-9c8021b10857', 'Nasa super Collant 3L', 1540, 1540, 6, null, false, false),
  ('2672b131-8f44-4e90-8d01-caf8d08f811e', '215/70R14 Michelin', 41800, 41800, 15, null, false, false),
  ('c00a0ff5-2e10-4924-9457-6e5e57a88f27', 'Xp100 phoenix 11p', 14333.5, 14333.5, 15, null, false, false),
  ('f894b3a9-740f-4a35-9dee-b17440eb16ba', 'Xp200 phoenix 21p', 26879.4, 26879.4, 4, null, false, false),
  ('6ddffdf7-4d73-48d9-9ff5-2df5da991b40', 'UGS210 phoenix 21p', 27740.5, 27740.5, 5, null, false, false),
  ('d36ae3c2-95e3-4e75-b00d-4378dbf570a9', 'Xp230 phoenix 23p', 30814.3, 30814.3, 6, null, false, false),
  ('45df22c4-0682-45f0-b060-f4b27b80d9d6', 'UGS235 Phoenix 23p', 31043.2, 31043.2, 2, null, false, false),
  ('4569d3f9-5fe3-4eab-9660-24eee16f0487', 'Tx1800 phoenix Tubular', 40984, 40984, 4, null, false, false),
  ('f5ccad4f-785c-47ea-9df6-4ca030610437', 'DIB135 Daewoo 17p', 24241.25, 24241.25, 5, null, false, false),
  ('534ff255-7f8d-4364-90a1-b19741516967', 'Dss140 daewoo 17p', 22252.5, 22252.5, 4, null, false, false),
  ('3d710f19-97a5-427b-bfe3-63fa39065f09', 'DIB110 Daewoo 15p', 21876.25, 21876.25, 10, null, false, false),
  ('fd90ccde-1f30-409b-bd16-4995551c1a1d', 'Sp35 AGS 5p', 5510, 5510, 10, null, false, false),
  ('12745b60-6dc2-43bd-b4fb-b4235d75002a', 'Sp100 AGS 11p', 13700, 13700, 25, null, false, false),
  ('8bd46d4d-958c-4e79-8dd3-92161e24dc01', 'MF70 AGS 13p', 12150, 12150, 5, null, false, false),
  ('ec134c11-6a1a-431d-a03c-d71771efa2bd', 'DIB165 Daewoo 21p', 32626.25, 32626.25, 15, null, false, false),
  ('bab6dbdf-d63d-48bc-bb99-0e64a85abda7', 'DIB180 Daewoo 23p', 36227.5, 36227.5, 6, null, false, false),
  ('f53285b7-5bef-4b4c-9f9d-f4ef9b9539af', 'DSS100 Daewoo 11p', 13780, 13780, 13, null, false, false),
  ('7bb9e818-267d-406e-b115-f0ed2c383c87', 'Tx1800 Tubular phoenix', 40984, 40984, 4, null, false, false),
  ('9d853373-6636-4718-ae35-aa4bc874ced5', 'EXT135 phoenix 15p', 19173.1, 19173.1, 4, null, false, false),
  ('15027660-18eb-43c1-8aec-7c008cc01b04', 'Xp100 phoenix 11p', 14333.5, 14333.5, 10, null, false, false),
  ('7e0984f6-1159-412a-a111-ea9ee191fe74', 'Xp260 phoenix 27p', 36700.3, 36700.3, 2, null, false, false),
  ('83ab579e-0efc-4a3a-81f6-1d55e847d6a5', 'Xp230 phoenix 23p', 30814.3, 30814.3, 2, null, false, false),
  ('41a2dff0-5ac4-4328-943e-eb73630eafb4', 'Xp115 phoenix 13p', 15292.7, 15292.7, 2, null, false, false),
  ('eefa8cf0-b655-49cb-9407-c7281ddb05c7', 'EXT145 phoenix 17p', 20982.5, 20982.5, 2, null, false, false),
  ('72810f65-3a30-4039-9960-902069304cf2', 'Xp120 phoenix 15p', 17167.5, 17167.5, 2, null, false, false),
  ('ef21fe7c-ad87-4e23-b701-51c43242119d', 'Xp200 phoenix 21p', 26879.4, 26879.4, 6, null, false, false),
  ('ba6310ca-94f4-46b3-af0e-85241c6435b1', 'UGS210 phoenix 21p', 27740.5, 27740.5, 2, null, false, false),
  ('d6329f5e-beb8-4226-b871-4a0e8952e7c5', 'Xp165 Phoenix 19p', 23347.8, 23347.8, 2, null, false, false),
  ('8dac3eff-0cac-484e-bff7-f782ecef1f8b', 'Sp35 AGS 5p', 5510, 5510, 10, null, false, false),
  ('da914e47-54cc-4815-a5de-0e39006f75ea', 'Sp100 AGS 11p', 13700, 13700, 25, null, false, false),
  ('d6d2a73b-8fba-4d87-b2b2-431b4418821e', 'MF70 AGS 13p', 12150, 12150, 5, null, false, false),
  ('c674afe8-e7fc-4796-912a-428bf5cc7de8', 'Sp50 AGS 9p', 8507.2, 8507.2, 10, null, false, false),
  ('a0c38861-e12f-46b7-a5d6-3cfc8dc045d0', 'Ws135 AGS 15p', 21018.4, 21018.4, 3, null, false, false),
  ('41208969-4c8d-490e-9199-20935bc3af2f', 'Ws150 AGS 17p', 22474.4, 22474.4, 5, null, false, false),
  ('4faf5dc6-d47a-4e2c-a47c-2c1d4a58bc60', 'Ws230 AGS 23p', 35484.8, 35484.8, 5, null, false, false),
  ('a5b6655f-1751-45db-bc14-5ec57342306d', 'Ht200 osaka 21p', 27500, 27500, 20, null, false, false),
  ('0a3afb05-dd96-4a93-87e4-598d09019a6b', 'V230 volta 23p', 30000, 30000, 2, null, false, false),
  ('3709ba0b-afb4-4973-b80f-a646d54ae07b', 'Ht160 osaka 19p', 24500, 24500, 5, null, false, false),
  ('3d77fc64-e7a2-47d0-acbe-85d9b79410d8', 'V160 volta 19p', 23000, 23000, 5, null, false, false),
  ('1b87a22c-0b2b-4ae1-8e8b-8674811bd83c', 'Ht1800 osaka Tubular', 40500, 40500, 4, null, false, false),
  ('fca02c3c-6ea5-40f8-91d4-d4dac39edf5f', '145R12 Hifly', 7500, 7500, 30, null, false, false),
  ('8c038efc-0556-46b0-85e7-de715a4cc541', '185/65R15 Hifly', 13000, 13000, 8, null, false, false),
  ('209eb606-ae3e-4245-9e4e-af065f09e63a', '185/55R16 Hifly', 15000, 15000, 4, null, false, false),
  ('d72cbcaf-e7ff-47b3-892b-de309b1644bc', '165/70R13 Hilfy', 9300, 9300, 20, null, false, false),
  ('ae27dcd0-ddcb-4015-9816-aa7e9c43b72b', '195R15 Evergreen', 22300, 22300, 12, null, false, false),
  ('b5568c29-f8c3-46c6-b85e-4e4a73a01b29', 'Evergreen 185R14', 18500, 18500, 6, null, false, false),
  ('6f00b698-8e33-48b5-b3ca-e9663e11bfd4', '195R14 Sunfull', 17500, 17500, 10, null, false, false),
  ('984b20a3-61f4-4ddd-8819-cd7457f45819', 'DSS140 Daewoo 19p', 22252.5, 22252.5, 5, null, false, false),
  ('9417b7e9-bef5-4b2d-b4f9-fdfdb9035a02', 'DSS190 daewoo 21p', 29670, 29670, 5, null, false, false),
  ('36996727-922f-47bf-a862-441a855a6dd8', 'DLS80 Daewoo 15p', 17482.5, 17482.5, 3, null, false, false),
  ('2135300e-86f6-432b-84fe-502a953a458c', 'DRS85 Daewoo 13p', 18585, 18585, 2, null, false, false),
  ('0745d84b-8166-4198-b5d0-5858e0cba724', 'DRS105 Daewoo 15p', 20842.5, 20842.5, 2, null, false, false),
  ('71de1515-8f42-4663-b300-0283ca19ab04', 'DLS120 Daewoo 17p', 25042.5, 25042.5, 1, null, false, false),
  ('6031b6bc-6c10-4960-8e75-221ec1408dc1', 'DRS120 Daewoo 17p', 25042.5, 25042.5, 1, null, false, false),
  ('85b85f62-df37-4bfa-a86d-08e656027f5c', 'Evergreen 185R14', 18500, 18500, 30, null, false, false),
  ('67f718ac-2767-494c-9680-f957b70df380', 'Yokohama 205/55R16', 25000, 25000, 4, null, false, false),
  ('cb6851a1-e1f9-4394-89d1-be067e4d7b88', '205/60R16 yokohama', 32000, 32000, 4, null, false, false),
  ('c8b3dc87-09fb-44b7-833d-fba743a74efa', '165/70R14 yokohama', 19000, 19000, 4, null, false, false),
  ('b584a71d-31fb-48ee-a25a-30e8e4949bea', '185/65R14 Sunny', 13000, 13000, 4, null, false, false),
  ('23bc5166-c02c-4df8-b2fb-9351d8dcb6c2', '165/65R14 sunny', 10500, 10500, 4, null, false, false),
  ('37f3fa3d-b9e8-4513-abe1-24aa4629374b', 'Triangle 195R14', 18500, 18500, 10, null, false, false),
  ('689c0cd8-c79a-4056-a396-c334df10dade', '145/70R12 Goform', 7800, 7800, 12, null, false, false),
  ('1d0ca87a-d8a2-492b-8b79-6a63d314caa4', '500-12 panther 16ply', 8800, 8800, 10, null, false, false),
  ('91497f6a-660a-4750-8956-78820b87dc02', '205R14 Bridgestone', 42000, 42000, 2, null, false, false),
  ('785da518-61ae-4d65-8477-4c3a908e0395', '145/70R12 Rovelo', 7600, 7600, 8, null, false, false),
  ('e3a230cf-5e10-46c3-9565-b263e4cf2c56', '205R14 Bridgestone', 42500, 42500, 2, null, false, false),
  ('b46e43eb-9978-4fe8-85e6-ec0b3efad10f', '145/80R13 Hifly', 9200, 9200, 4, null, false, false),
  ('0a11c76a-049a-4ec4-b702-904e401ac2c7', 'Linglong 195/65R15 W.L', 15150, 15150, 12, null, false, false),
  ('7f2752c9-fa11-4f2a-b7a8-5274924ab856', '185R14 Evergreen', 18500, 18500, 50, null, false, false),
  ('24d4ca84-b6c6-42b5-8bc1-ee84538fc088', '195R15 Evergreen', 22500, 22500, 12, null, false, false),
  ('bd173a3a-43de-473f-b176-7e1af5cee855', '195R14 Evergreen', 20400, 20400, 12, null, false, false),
  ('8e92115a-ff1f-4436-817f-5230f1ca557a', '145/70R12 Sunfull', 7700, 7700, 30, null, false, false),
  ('9e6f5195-f491-4c33-9101-2a4d3cd3fb63', '155/70R12 Sunfull', 8000, 8000, 12, null, false, false),
  ('05b27774-7a76-42e6-bc97-4f516579135f', '165/65R14 Sunfull', 10000, 10000, 20, null, false, false),
  ('e86cfdbe-69c1-4522-9fc0-65146167d667', '145R12 Sunfull', 8000, 8000, 12, null, false, false),
  ('44d514e4-0a6a-48c4-a43b-b89f1076b3a1', '205R14 Bridgestone', 41800, 41800, 15, null, false, false),
  ('74d82596-783e-48aa-9e3a-11ec586b886d', '195R14 Triangle', 18500, 18500, 7, null, false, false),
  ('757bf96f-cf0c-4b6a-9ff7-9dc10fb601a1', '500-12 16ply Panther', 9000, 9000, 5, null, false, false),
  ('135dc456-e22b-44ec-96c3-f6f96eab181f', '135-10 14ply Panther', 5100, 5100, 5, null, false, false),
  ('2a26db18-b255-4bd4-a4b3-c4aa2f4c5495', '6.50-14 Tube panther', 760, 760, 25, null, false, false),
  ('6889827e-8d72-431f-966c-e0875e84c20d', '6.50-16 Tube panther', 840, 840, 25, null, false, false),
  ('fe692273-573e-4f89-ae31-69e051bf1050', '500-12 Tube Panther', 660, 660, 50, null, false, false),
  ('c0929922-0538-4aa4-a879-d8823b3ca276', '205/60R16 Armstrong', 16231.68, 16231.68, 4, null, false, false),
  ('e67c59e3-193d-4e23-a99c-548213137472', '205/55R16 Armstrong', 15840, 15840, 4, null, false, false),
  ('6b56920c-296e-4229-b9f6-c439ef417c9a', '195R15 Armstrong', 19368, 19368, 5, null, false, false),
  ('2661ce83-394b-42b5-ad5d-af49fbef5139', '185/65R15 Armstrong', 13200, 13200, 4, null, false, false),
  ('e2086334-d385-40aa-b936-e6bfa4607f24', '145R12 Armstrong', 7608, 7608, 10, null, false, false),
  ('d9df08ef-29e8-4ffb-89a0-b9944ed630f1', '175/70R13 Armstrong', 10166.4, 10166.4, 8, null, false, false),
  ('3f510bbe-f764-40fb-8f01-281850c4809e', '195/65R15 Armstrong', 13622.4, 13622.4, 12, null, false, false),
  ('6b9f1f82-dac3-4b5d-b020-a1370d187869', 'Michelin 215/75R14', 41250, 41250, 15, null, false, false),
  ('624225f7-34ca-4dfc-bc1f-a2a6e890ad51', 'Apex Lithium battery 12V', 56650, 56650, 1, null, false, false),
  ('fbcf543c-ede6-4c06-afc4-ae3de13a5f0f', 'Apex Lithium Battery 24v', 123600, 123600, 1, null, false, false),
  ('afb4fd17-1505-4aba-af13-a37c5679c59d', 'Bridgestone 205R14', 41800, 41800, 15, null, false, false),
  ('4f48225c-c394-466e-93f4-c5ad5bda7b7c', 'DIB135 Daewoo 19p', 26599.5, 26599.5, 10, null, false, false),
  ('1513d551-e92a-4f25-85d2-95e70eb7b4e7', 'DLS65 Daewoo 11p', 13072.5, 13072.5, 5, null, false, false),
  ('b3a5fc60-1db9-48a7-b772-f4d54a1a643d', 'DLS70 Daewoo 13p', 13597.5, 13597.5, 3, null, false, false),
  ('a85884ad-c673-4e2a-a160-19f49a489339', 'DIB110 Daewoo 17p', 24012, 24012, 10, null, false, false),
  ('43101590-c56b-42aa-a28c-14204c066a5f', '185/65R15 yokohama', 21800, 21800, 8, null, false, false),
  ('8be17c11-dfba-4a35-8cbe-0061dd5c2e03', '195/65R15 Yokohama', 22000, 22000, 4, null, false, false),
  ('1499bc47-49d4-4d13-bd01-3e6791363962', 'Xp200 phoenix 21p', 26879.4, 26879.4, 10, null, false, false),
  ('64d78616-c8c8-4729-a8e0-14884d9ce4a6', 'UGS210 phoenix 21p', 27740.5, 27740.5, 4, null, false, false),
  ('05f0f838-4f4a-45f2-9189-80a357e76f63', '145/80R13 Hifly', 9400, 9400, 6, null, false, false),
  ('972d6215-18e4-4347-9aed-821a0d92ec7c', '145/80R13 Hifly', 9400, 9400, 6, null, false, false),
  ('1295df6d-acf2-4f12-9423-10e7d1aeb0e0', 'Apex Lithium 12v', 56650, 56650, 1, null, false, false),
  ('50a26cb9-186b-4b5d-974c-9f8b2457b6b7', 'Xp Solar 50 phoenix', 5264.7, 5264.7, 10, null, false, false),
  ('9f8a05e4-4757-4098-8780-8dfb02e67680', 'Xp200 phoenix 21p', 26879.4, 26879.4, 10, null, false, false),
  ('c587ec2e-c504-49f3-8648-942290f6b7d6', 'Xp230 phoenix 23p', 30814.3, 30814.3, 5, null, false, false),
  ('de869f95-6614-4171-be0d-f1ed07df1b1d', 'Xp60L phoenix 9p', 7924.3, 7924.3, 7, null, false, false),
  ('d7bfb36e-7de1-438c-8d3d-1d22c81ff5fa', 'Tx1800 phoenix Tubular', 40984, 40984, 4, null, false, false),
  ('f74bfcc4-849e-441f-ab28-9814b61f7a23', '185R14 Evergreen', 18500, 18500, 50, null, false, false),
  ('e3d44148-19cd-4585-8726-b9ae3cbbc441', '165/70R13 evergreen', 11000, 11000, 4, null, false, false),
  ('1cd5b64c-6e3e-46ef-a41a-8b20ed5872a9', '165/65R14 Evergreen', 11500, 11500, 4, null, false, false),
  ('bd1370df-b02b-46a3-91cf-a8bc11e8e814', '145/80R13 General', 10500, 10500, 6, null, false, false),
  ('5cde31c6-04ba-4739-853d-2cdc2194cb8c', '500-12 superking claim Re', 850, 850, 2, null, false, false),
  ('43fc73c3-c0d3-449c-a0cf-563eb53833ef', '145/70R12 Rovelo', 7600, 7600, 6, null, false, false),
  ('e078710c-560d-4410-901a-c832e7886da0', 'Bridgestone 205R14', 42500, 42500, 5, null, false, false),
  ('26dc3e78-6fa2-43f4-8687-a95a95a4ac52', '195/70R14 Goform', 12800, 12800, 4, null, false, false),
  ('e3883c24-b5e5-4974-b0ce-15ff07d470d2', '165/65R13 Aplus', 9200, 9200, 4, null, false, false),
  ('588d2b35-26ef-490e-a9e8-7383ca08ab26', '215/75R14 Tercelo', 28000, 28000, 10, null, false, false),
  ('65a879f5-eef3-40d1-967e-61063bcb4c1c', 'DIB165 Daewoo 21p', 35292, 35292, 2, null, false, false),
  ('6c53d848-36a9-4f7d-af87-492545954ee7', 'DSs190 Daewoo 21p', 32079, 32079, 5, null, false, false),
  ('ab047593-19c6-4204-a776-ee92283f3f6a', 'DLS65 Daewoo 13p', 12823.5, 12823.5, 5, null, false, false),
  ('9d33806c-5c4a-4983-a0b9-3683647412ab', 'DRS70 Daewoo 13p', 13338.5, 13338.5, 1, null, false, false),
  ('3e774a6e-62f9-4d2f-a167-d7ff150ca486', 'DIN600 Daewoo 13p', 18900.5, 18900.5, 2, null, false, false),
  ('119de38e-bd2c-48ea-a8a7-f549d7cf2266', 'DIN666 Daewoo 14p', 20188, 20188, 2, null, false, false),
  ('c97f0ff4-42ff-498a-94e5-81319eba5d32', 'DSS100 Daewoo', 13390, 13390, 15, null, false, false),
  ('9a6d3424-6a4f-4f0e-ad2f-8a94ed59ae64', '165R13 Goform', 12500, 12500, 2, null, false, false),
  ('cf44db0e-5ae6-45c8-82a0-f543b8a4751d', '750-16 Panther 8ply', 16400, 16400, 2, null, false, false),
  ('16abe9cf-995f-4a2f-9470-68b7c4542d33', '265/65R17 Goform', 30000, 30000, 4, null, false, false),
  ('1d62aa95-8441-4990-9278-44bfd69fec2a', '195R14 Triangle', 18500, 18500, 4, null, false, false),
  ('ef5fcc60-cc96-4cbb-9111-7039fcaebf79', '600-16 Panther 8 ply', 11500, 11500, 4, null, false, false),
  ('d3e2d5df-4b12-4ed2-8c92-37fb142c33c7', '600-16 Panther tube', 900, 900, 4, null, false, false),
  ('020eea4c-1f13-4374-b2c1-830d565433a5', '650-14 Panther 10ply', 18300, 18300, 8, null, false, false),
  ('14754235-7d36-47c8-9adb-95ea05794461', '215/75R14 Michelin', 41800, 41800, 5, null, false, false),
  ('582c91c9-b734-484c-9eb1-d964580cb866', 'HT60 Osaka 9p', 7675.2, 7675.2, 8, null, false, false),
  ('539a863b-e776-42e9-9396-6ecb711ceff8', 'HT55 Osaka 7p', 6344, 6344, 6, null, false, false),
  ('0519491a-4950-45d0-9bd7-2f7eb9d70fca', 'HT200 Osaka 21p', 25220, 25220, 15, null, false, false),
  ('a7a84a5a-c694-47d1-9f83-fa33c5cb93d5', 'HT160 osaka 19p', 22360, 22360, 10, null, false, false),
  ('f32a95be-0c5d-4f3d-aff3-8501b044c6b0', 'Sp150 AGS 19p', 24750.9, 24750.9, 6, null, false, false),
  ('f0d5a467-30af-4bf3-b0db-d2001bfd18db', 'Sp180 AGS 21p', 27913, 27913, 5, null, false, false),
  ('3746ad42-6684-4513-aca5-b363d57e8870', 'Ws195 AGS 21p', 28077.8, 28077.8, 2, null, false, false),
  ('d8815cbc-8042-4284-9285-b32c8d5a24ee', 'HT1800 Osaka', 36000, 36000, 4, null, false, false),
  ('4094738d-882e-446b-b2e8-d90628a8180c', '650-14 magnum', 28500, 28500, 4, null, false, false),
  ('e335340a-e7ad-4cc4-a2f1-8c0f21a471e4', '205/70R15 General', 20800, 20800, 2, null, false, false),
  ('518f1cb1-be1a-425c-a8ed-5a7b952f87bf', '205R14 Bridgestone', 42500, 42500, 15, null, false, false),
  ('978040ed-876c-4b06-bfdc-f25442c88a06', '195/85R16 Rovelo', 31000, 31000, 4, null, false, false),
  ('4f425472-22a7-49b4-8248-58c3c8e8861b', 'HT270 Osaka 27p', 34711, 34711, 2, null, false, false),
  ('bc21588b-192f-404d-a937-c689e263b7b6', 'HT145 osaka 17p', 19930.5, 19930.5, 2, null, false, false),
  ('2c7b72bf-604b-4af9-a1d6-c2b83ad4438d', 'HT70 Osaka 11p', 9424.5, 9424.5, 2, null, false, false),
  ('95f0b92a-9789-4da8-a34b-e61a5fb145b3', 'HT115 osaka 11p', 13493, 13493, 5, null, false, false),
  ('0ad57b7d-4884-4312-87f8-389261b635ad', 'MF70 osaka 11p', 10825.3, 10825.3, 5, null, false, false),
  ('193b424c-46f8-422f-959e-fa20fbb7a49b', 'HT1800 osaka Tubular', 35280, 35280, 2, null, false, false);

-- ===== Stock purchases (644 line items from merchant invoices) =====
insert into public.stock_purchases (date, quantity, purchase_price, supplier_name, product_id) values
  ('2026-01-17', 35, 7700, 'Moen Sunfull/ Evergreen Tyre', '8a878f60-9742-48f6-be69-274d08cfcbcb'),
  ('2026-01-17', 11, 7800, 'Moen Sunfull/ Evergreen Tyre', 'dfe64997-ea8a-4659-8a6d-f85a29793f76'),
  ('2026-01-17', 15, 10200, 'Moen Sunfull/ Evergreen Tyre', 'f48d9c4d-8b21-421b-b65b-d49f4ecdaaeb'),
  ('2026-01-17', 15, 10200, 'Moen Sunfull/ Evergreen Tyre', 'ebc87171-33d5-4db6-8528-ecda4b6babcd'),
  ('2026-01-17', 2, 10700, 'Moen Sunfull/ Evergreen Tyre', 'ab22a245-18f6-48bd-821a-6fb86be4b7ef'),
  ('2026-01-17', 6, 11700, 'Moen Sunfull/ Evergreen Tyre', '20cbaec2-4a78-413f-b047-6a9e7d055b4b'),
  ('2026-01-17', 13, 8000, 'Moen Sunfull/ Evergreen Tyre', '1f744ea6-332a-42a8-8d01-c91bf0fd2505'),
  ('2026-01-17', 7, 8500, 'Moen Sunfull/ Evergreen Tyre', '54ddb1d5-150d-4d6f-9916-d006d7c6bc7b'),
  ('2026-01-17', 2, 13500, 'Moen Sunfull/ Evergreen Tyre', '345ba395-487c-4240-ab30-5baf1937aa71'),
  ('2026-01-17', 11, 13700, 'Moen Sunfull/ Evergreen Tyre', '87460842-8bd5-4fc3-8078-237b0a112bb1'),
  ('2026-01-17', 8, 17000, 'Moen Sunfull/ Evergreen Tyre', '17a338c2-2a26-439c-aaa9-90009ed2b9b7'),
  ('2026-01-17', 9, 15200, 'Moen Sunfull/ Evergreen Tyre', '9941cd70-68a4-4282-b2ba-c1b3ffb85064'),
  ('2026-01-17', 7, 30000, 'Moen Sunfull/ Evergreen Tyre', 'd7a17e4e-525c-4586-a1a3-a11111332920'),
  ('2026-01-17', 18, 21400, 'Moen Sunfull/ Evergreen Tyre', '5ae4a125-3baf-4b76-837e-df8ccd33d0d8'),
  ('2026-01-17', 46, 18500, 'Moen Sunfull/ Evergreen Tyre', '3952bec9-9db2-4646-899e-67dda5aabb7b'),
  ('2026-01-17', 12, 23700, 'Moen Sunfull/ Evergreen Tyre', '7905d6ca-4038-4a33-aff7-908c6fc9cd8e'),
  ('2026-01-17', 2, 15600, 'Moen Sunfull/ Evergreen Tyre', '3859c0a0-b6e0-469a-bb7e-a08d2e334723'),
  ('2026-01-17', 21, 15000, 'Moen Sunfull/ Evergreen Tyre', '80ff625e-44f7-467f-bc2b-9fbdb2d04234'),
  ('2026-01-17', 12, 15900, 'Moen Sunfull/ Evergreen Tyre', 'a500e188-96de-422f-9cb1-e1a5f8a2a4f9'),
  ('2026-01-17', 1, 11700, 'Moen Sunfull/ Evergreen Tyre', 'ce124eb1-fee2-4730-a6aa-287058dbfdfe'),
  ('2026-01-17', 15, 11200, 'Moen Sunfull/ Evergreen Tyre', '0ede6860-2dce-4e30-ab5d-ece57003b5ad'),
  ('2026-01-17', 11, 11000, 'Moen Sunfull/ Evergreen Tyre', '72a5d0fe-ec4a-47de-a84b-1e2db1209457'),
  ('2026-01-17', 7, 10000, 'Moen Sunfull/ Evergreen Tyre', 'd06c8f5d-23af-4491-be2c-b3382cafb659'),
  ('2026-01-17', 5, 11000, 'Moen Sunfull/ Evergreen Tyre', '14763438-0af1-4b0a-b481-b9541af3e0d7'),
  ('2026-01-17', 8, 19700, 'Moen Sunfull/ Evergreen Tyre', 'fcef411d-f523-4cb6-bcdd-a542b37128b9'),
  ('2026-01-17', 8, 19500, 'Moen Sunfull/ Evergreen Tyre', '05258a8e-cb0d-4023-9a13-f434391f8e34'),
  ('2026-01-17', 2, 25500, 'Moen Sunfull/ Evergreen Tyre', 'aa8f911e-a216-4331-a46e-06c7a3cad154'),
  ('2026-01-17', 4, 8900, 'Moen Sunfull/ Evergreen Tyre', 'b73856e2-101f-421b-b25a-3dea8bb43267'),
  ('2026-01-17', 4, 14200, 'Moen Sunfull/ Evergreen Tyre', '6529308b-65ee-49c5-ad9c-a902ffee3d52'),
  ('2026-01-17', 7, 7600, 'Imran STD / Hifly', 'edb632a7-5205-4688-a91c-711166000088'),
  ('2026-01-17', 2, 8000, 'Imran STD / Hifly', '02dffc78-0840-46c5-bdf9-26fee27ff76e'),
  ('2026-01-17', 10, 9900, 'Imran STD / Hifly', 'e3c2ec0d-0c58-4ce7-a786-ad87c3993eb6'),
  ('2026-01-17', 10, 9900, 'Imran STD / Hifly', 'cac16bbe-6e72-4507-9de5-222e6f8a956b'),
  ('2026-01-17', 3, 13300, 'Imran STD / Hifly', '38c3da6a-4e87-4578-a212-9813f04d0841'),
  ('2026-01-17', 18, 13500, 'Imran STD / Hifly', 'ce01a18c-2a24-4207-94b4-8f77e24cfaba'),
  ('2026-01-17', 6, 9000, 'Imran STD / Hifly', 'ea2c2b52-783b-4937-810c-8be56b8d6526'),
  ('2026-01-17', 3, 7600, 'Imran STD / Hifly', 'b2b9881a-0bec-4783-9a76-99ece7f81bc6'),
  ('2026-01-17', 8, 12000, 'Imran STD / Hifly', '7a9cbc0e-f7b9-4cd3-bceb-735f626b4a52'),
  ('2026-01-17', 8, 10000, 'Imran STD / Hifly', '7ae91975-10a2-4ce9-aee6-24e821d936e2'),
  ('2026-01-17', 6, 12000, 'Imran STD / Hifly', 'f830ee2e-2c0e-48ef-beb1-da79c69b0fbb'),
  ('2026-01-17', 8, 12400, 'Imran STD / Hifly', '7278e666-e119-432d-9486-b3f39d7ff162'),
  ('2026-01-17', 4, 16000, 'Imran STD / Hifly', '52a40f30-b749-4412-86ca-77bfa83241c7'),
  ('2026-01-17', 12, 16100, 'Imran STD / Hifly', '2215b7d2-88df-424b-8e73-0968d0f92702'),
  ('2026-01-17', 8, 17600, 'Imran STD / Hifly', 'a086a44f-0387-4230-b575-325aff8bc56e'),
  ('2026-01-17', 24, 9500, 'Imran STD / Hifly', '6de6b435-7597-45ac-8e78-b1e68054ee24'),
  ('2026-01-18', 4, 11500, 'Hassan Iqbal Lahore', 'e76a0b24-8069-4ec6-8652-f07c10bb1dd5'),
  ('2026-01-18', 2, 12500, 'Hassan Iqbal Lahore', '82ecf615-2ab1-40b6-8b29-006dd799da07'),
  ('2026-01-18', 4, 15000, 'Hassan Iqbal Lahore', '8bc54924-9c51-4f22-b273-2a7e854b9c63'),
  ('2026-01-18', 4, 12000, 'Hassan Iqbal Lahore', 'f57a6995-92b5-4a0f-96b0-09cc88e3dab3'),
  ('2026-01-18', 6, 19400, 'Hassan Iqbal Lahore', 'c692cee3-cd64-40c2-9ea3-05cd3b279f74'),
  ('2026-01-18', 7, 7850, 'Hassan Iqbal Lahore', '81ac0200-f86f-49ec-840e-177cf4b6e30c'),
  ('2026-01-18', 2, 13000, 'Hassan Iqbal Lahore', '56e62de4-7040-413a-975c-6c0326c5a2f6'),
  ('2026-01-18', 2, 13500, 'Hassan Iqbal Lahore', '7d32f702-436f-440e-a4e1-039f307c4219'),
  ('2026-01-18', 2, 12500, 'Hassan Iqbal Lahore', 'b63ff83c-aed6-47b2-96bd-6ff88117c198'),
  ('2026-01-18', 2, 13000, 'Hassan Iqbal Lahore', '4264e46a-e96a-4ad5-849b-271fba79012d'),
  ('2026-01-18', 2, 10400, 'Hassan Iqbal Lahore', '39d6b661-9354-4153-a9dc-ddc86ca2eae7'),
  ('2026-01-18', 8, 10000, 'Hassan Iqbal Lahore', 'b8db23ea-ee22-4400-bb66-cdb46a80e1c8'),
  ('2026-01-18', 6, 11500, 'Abdula waris Tyre / Shazaman', 'b93e6e6c-ec67-48f5-a8fb-63375618a6f5'),
  ('2026-01-18', 2, 12500, 'Abdula waris Tyre / Shazaman', '5802e98a-e32f-4828-aa21-d0d444bdd2ca'),
  ('2026-01-18', 6, 12000, 'Abdula waris Tyre / Shazaman', '32a853aa-4881-42b8-a84b-2bfdfcc808ce'),
  ('2026-01-18', 6, 29000, 'Abdula waris Tyre / Shazaman', '103632df-9414-43e2-a384-62f8347395a3'),
  ('2026-01-18', 6, 14800, 'Abdula waris Tyre / Shazaman', '1476d368-926a-4f9d-876d-026a7b1c350d'),
  ('2026-01-18', 9, 16500, 'Abdula waris Tyre / Shazaman', '8f3f2a1a-55be-441c-a074-23c2d5a20dfa'),
  ('2026-01-18', 2, 29000, 'Abdula waris Tyre / Shazaman', '172252c0-84ee-44bc-a6e3-c416dd1cfecb'),
  ('2026-01-18', 12, 7300, 'Hanzala iqbal / Zmax Tyre', '23a064d9-de77-4ce7-a797-5127eca76c31'),
  ('2026-01-18', 4, 7800, 'Hanzala iqbal / Zmax Tyre', '6a31dfba-1aba-4463-84d2-c99ad26961dd'),
  ('2026-01-18', 12, 9700, 'Hanzala iqbal / Zmax Tyre', '924a4a94-267a-4fe6-b36d-cd2446696f2e'),
  ('2026-01-18', 12, 9700, 'Hanzala iqbal / Zmax Tyre', '440d835f-ca39-4b5c-9ee1-90d7262b937c'),
  ('2026-01-18', 12, 13300, 'Hanzala iqbal / Zmax Tyre', '5368dfa2-650c-4253-a116-d9e91e9ce2c9'),
  ('2026-01-18', 4, 9000, 'Hanzala iqbal / Zmax Tyre', 'dda3f918-cce4-468d-a3c1-771d51c383b2'),
  ('2026-01-18', 4, 8300, 'Hanzala iqbal / Zmax Tyre', '65e5a4cf-4ea5-45d1-a0b7-cf70d76809b8'),
  ('2026-01-18', 4, 7500, 'Awami Tyre / zeeshan jahngir', 'a5a08cb3-894f-403a-9dbb-d38056ad05f7'),
  ('2026-01-18', 22, 7500, 'Awami Tyre / zeeshan jahngir', '60387931-bfa0-48e4-80c0-1cb70564a2fc'),
  ('2026-01-18', 2, 15000, 'Awami Tyre / zeeshan jahngir', 'b731deea-812c-465e-a084-c1d31ff2443d'),
  ('2026-01-18', 2, 13800, 'Awami Tyre / zeeshan jahngir', '63f6fdf5-b94e-4f4a-9ad4-1fae98a54956'),
  ('2026-01-18', 10, 19000, 'Awami Tyre / zeeshan jahngir', 'aa9c5191-0e96-4dc3-b640-0861a0b48ee6'),
  ('2026-01-18', 10, 4100, 'Awami Tyre / zeeshan jahngir', '4cfdc6a4-666c-4bc0-b850-9ccf0c268157'),
  ('2026-01-18', 10, 6750, 'Awami Tyre / zeeshan jahngir', 'ab2a15e4-9157-4c7f-8502-ff8d28a7ee57'),
  ('2026-01-18', 15, 6850, 'Awami Tyre / zeeshan jahngir', '0e9415b2-7273-4fc7-92cf-f118134aadd8'),
  ('2026-01-18', 10, 8800, 'Awami Tyre / zeeshan jahngir', '5fb330df-4982-4b97-b5d6-d752b4f592fc'),
  ('2026-01-18', 10, 5500, 'Awami Tyre / zeeshan jahngir', '246c2b73-9df2-495e-9737-c65917c9ec9a'),
  ('2026-01-18', 2, 14000, 'Awami Tyre / zeeshan jahngir', 'e784f3c4-2b26-40b6-981d-13d128e4cc7f'),
  ('2026-01-18', 2, 13500, 'Awami Tyre / zeeshan jahngir', 'ba659645-3fa6-4e33-b72c-31eacc97168f'),
  ('2026-01-18', 6, 5500, 'Usman LEDs lahore', 'daef7e0a-7e59-4f97-bf67-6e4e3eb8697c'),
  ('2026-01-18', 6, 5500, 'Usman LEDs lahore', 'ea77a6d6-756c-4985-99df-fbcdc035e7db'),
  ('2026-01-18', 6, 5500, 'Usman LEDs lahore', '7895c3f0-b669-4dcc-8e77-a65293c24677'),
  ('2026-01-18', 1, 9500, 'Usman LEDs lahore', '3a3c8fdd-9b58-444e-a63a-1ab948ff19e2'),
  (default, 2, 11500, 'Unknown', 'd06c8f5d-23af-4491-be2c-b3382cafb659'),
  ('2026-01-20', 8, 22795, 'Alnawaz Trader / Azam', 'c73cf802-d099-40a5-88e6-8dbc7aad6e70'),
  ('2026-01-20', 4, 26675, 'Alnawaz Trader / Azam', 'd7cb64a4-c2b1-4a3e-b3d8-6d882908fbfc'),
  ('2026-01-20', 1, 32204, 'Alnawaz Trader / Azam', 'a8952918-ded1-47f1-8294-53f9cd83a6c5'),
  ('2026-01-20', 4, 20622.2, 'Alnawaz Trader / Azam', 'd8a24225-f61b-4114-abd1-5ae9628c4e92'),
  ('2026-01-20', 3, 19012, 'Alnawaz Trader / Azam', '50094451-0a8b-490a-a1c5-35d9aa9ba316'),
  ('2026-01-20', 3, 18284.5, 'Alnawaz Trader / Azam', 'd70ff2a0-b639-4f30-a784-d72207423799'),
  ('2026-01-20', 6, 11737, 'Alnawaz Trader / Azam', 'c4c6cbcf-dc21-4c40-b4b4-bd236c5fe6e1'),
  ('2026-01-20', 13, 7144.05, 'Alnawaz Trader / Azam', '95bf8c4f-fe31-4f3d-8557-190ec9147d91'),
  ('2026-01-20', 4, 34435, 'Alnawaz Trader / Azam', 'ba65adef-58dc-4b3d-a013-f865042a2fae'),
  ('2026-01-20', 2, 17523, 'Alnawaz Trader / Azam', '0de08654-0a78-4049-aafd-85b69cf1fdff'),
  ('2026-01-20', 4, 27489, 'Trible Battery Multa', '2320ab30-d91f-4f37-9f8b-6d6afbd864d9'),
  ('2026-01-20', 4, 12274.5, 'Trible Battery Multa', '0eaefb57-8027-4470-af68-91d9a07e00a4'),
  ('2026-01-20', 3, 15735.2, 'Trible Battery Multa', '3b5daf8e-2e89-4f65-93d0-ccfaa9d0f573'),
  ('2026-01-20', 5, 4499.25, 'Trible Battery Multa', 'a1df250a-b570-4ddc-b407-11d81e1d3ed2'),
  ('2026-01-19', 7, 7144.05, 'Alnawaz Trader / Azam', 'b59db48f-bddf-4be6-98ee-21a4338e8990'),
  ('2026-01-19', 17, 8303.2, 'Alnawaz Trader / Azam', 'a28c5751-a731-46c5-913f-308c233131d7'),
  ('2026-01-19', 7, 6232.25, 'Alnawaz Trader / Azam', 'edd3a8d0-cd0d-4c65-9ec6-6de48e9fa0ca'),
  ('2026-01-19', 3, 8870.65, 'Alnawaz Trader / Azam', '02d15708-cc7b-418b-870e-62810cc1d842'),
  ('2026-01-19', 10, 4520.2, 'Alnawaz Trader / Azam', '74dad60c-fcbd-4111-abef-7fc0fbc6b71c'),
  ('2026-01-19', 5, 10296, 'Alnawaz Trader / Azam', 'b9509cd9-f5a0-48ab-8c75-a1f423f1977e'),
  ('2026-01-19', 7, 8217, 'Alnawaz Trader / Azam', '9a0265e5-10ed-4859-8944-f0166600be74'),
  ('2026-01-19', 4, 11737, 'Alnawaz Trader / Azam', 'f7efa096-4b46-4707-8d0e-f47ba1d9be58'),
  ('2026-01-19', 1, 15175.65, 'Alnawaz Trader / Azam', 'e80ffd43-6649-4f0a-8ac8-2148c93a8eaa'),
  ('2026-01-19', 2, 18284.5, 'Alnawaz Trader / Azam', '5bf2d58f-1848-4035-835d-54a0ec74c434'),
  ('2026-01-19', 2, 19012, 'Alnawaz Trader / Azam', 'b6023918-2b98-469f-be23-379c05703b18'),
  ('2026-01-19', 9, 16878, 'Alnawaz Trader / Azam', '267c98f3-eb5c-48d9-a83d-176ec96cc437'),
  ('2026-01-19', 7, 22795, 'Alnawaz Trader / Azam', '9302b467-c9cc-4b15-ba23-5f0bcc9da30b'),
  ('2026-01-19', 1, 26675, 'Alnawaz Trader / Azam', '8b1b16df-4e76-4db8-9aa7-efac7169020d'),
  ('2026-01-19', 1, 32204, 'Alnawaz Trader / Azam', 'c89379f3-d990-4e79-99e4-ff01b0c43875'),
  ('2026-01-19', 6, 20622.2, 'Alnawaz Trader / Azam', 'f30133de-bdeb-4617-a331-77943d8483f9'),
  ('2026-01-19', 1, 15642, 'Alnawaz Trader / Azam', '21045e19-726c-487f-9f28-4619f02daa0d'),
  ('2026-01-19', 1, 7084.8, 'Alnawaz Trader / Azam', 'c92de01e-9569-4846-a034-f60168a5313a'),
  ('2026-01-19', 2, 5808, 'Alnawaz Trader / Azam', 'fb190246-0e5d-4d01-b7ae-385e8d4e587b'),
  ('2026-01-19', 1, 16608, 'Alnawaz Trader / Azam', '484a968e-9e31-43ca-a1d3-7ec066ec9243'),
  ('2026-01-19', 5, 28355, 'Alnawaz Trader / Azam', '999e66aa-4977-4de8-bd40-427bb0f32be6'),
  ('2026-01-19', 2, 25016, 'Alnawaz Trader / Azam', '8d66a17f-efc7-4ca1-9501-b6828350cffe'),
  ('2026-01-19', 2, 27454, 'Alnawaz Trader / Azam', '50e64f50-b7fb-4fea-afd4-97f2924e2d44'),
  ('2026-01-19', 4, 11368.5, 'Alnawaz Trader / Azam', 'f203682f-d57a-4873-9214-97371abf0e6a'),
  ('2026-01-19', 5, 15264, 'Alnawaz Trader / Azam', '7529846d-4028-4f13-a127-185963f4c8d3'),
  ('2026-01-19', 5, 17437, 'Alnawaz Trader / Azam', 'ab38d019-e1d4-46c7-8902-b2f195bda1d2'),
  ('2026-01-19', 7, 16430, 'Alnawaz Trader / Azam', '53ac1f1e-0786-4765-9929-444ab2ee90ba'),
  ('2026-01-19', 3, 19111.8, 'Alnawaz Trader / Azam', '7b3c4ede-11bd-4ede-b3d3-c37cf2f78387'),
  ('2026-01-19', 5, 21300, 'Trible Battery Multa', '2df23349-5066-4f0a-a1a1-8d690b40eeca'),
  ('2026-01-19', 1, 24060, 'Trible Battery Multa', 'a626285a-5083-477f-8543-350377f87ee9'),
  ('2026-01-19', 1, 25666, 'Trible Battery Multa', 'c1daccec-140b-4120-9859-9805116873dd'),
  ('2026-01-19', 3, 25540, 'Trible Battery Multa', '38b30044-db45-4f61-b26b-47579f7966e7'),
  ('2026-01-19', 2, 20650, 'Trible Battery Multa', 'a957a1ad-d515-4559-a851-e678c8665369'),
  ('2026-01-19', 1, 17400, 'Trible Battery Multa', 'f8d70e65-5e2b-44be-8b73-87c31d8bc6a2'),
  ('2026-01-19', 2, 12440, 'Trible Battery Multa', '81f726eb-d0cd-4baf-95b4-ed14e49619c2'),
  ('2026-01-19', 3, 24542.1, 'Trible Battery Multa', '9eb3f1b5-90d5-4172-bae6-1c4f1750643f'),
  ('2026-01-19', 7, 21483, 'Trible Battery Multa', 'c4109126-2c27-4bdf-b34e-83da86c02613'),
  ('2026-01-19', 3, 23166, 'Trible Battery Multa', 'a4c398d3-bd02-4ff2-a720-a052e622c30e'),
  ('2026-01-19', 1, 25146, 'Trible Battery Multa', 'b2a48d4b-119f-42b5-b021-3e9b62be14c5'),
  ('2026-01-19', 3, 30294, 'Trible Battery Multa', '9c50fd6d-8cd3-4a70-a721-d7aea1a3696e'),
  ('2026-01-19', 4, 12365.1, 'Trible Battery Multa', '613516cd-8b8a-4f7f-ac24-ef405d2079ad'),
  ('2026-01-19', 6, 19600, 'Trible Battery Multa', '3e95e6f6-0e5a-4ff6-9d18-d67c0cf7d09b'),
  ('2026-01-19', 4, 17305.6, 'Trible Battery Multa', 'aca83521-b3e6-4452-9f57-1357db7e4591'),
  ('2026-01-02', 1, 12648, 'Daewoo battery Ameer hamza', 'b161911f-be5a-435e-aacb-f6bc63d4033c'),
  ('2026-01-02', 1, 20400, 'Daewoo battery Ameer hamza', 'b6684e62-acf0-4035-86a1-2f34ea5aed5d'),
  ('2026-01-02', 2, 17034, 'Daewoo battery Ameer hamza', '4faf4022-6a48-4344-8a5e-7d7853ef0f35'),
  ('2026-01-02', 1, 19240, 'Daewoo battery Ameer hamza', '9d4cd797-2d44-4103-bd74-2fa8fad9a571'),
  ('2026-01-02', 1, 21320, 'Daewoo battery Ameer hamza', '8013d148-2313-4e1f-bd64-bccc03ea8bdb'),
  (default, 8, 9700, 'Awami Tyre / zeeshan jahngir', '51bb62ad-1708-4670-a5e3-3f9eae95c73d'),
  ('2026-01-04', 50, 450, 'Awami Tyre / zeeshan jahngir', '3d72e73c-42be-49ed-b59d-aa4c2c774e80'),
  ('2026-01-04', 25, 760, 'Awami Tyre / zeeshan jahngir', '9c62472e-597b-4031-9203-85f57b32d545'),
  ('2026-01-04', 25, 850, 'Awami Tyre / zeeshan jahngir', 'c7f4666e-74e6-45b7-95c4-d55bf2c29ff7'),
  ('2026-01-04', 1, 8800, 'Awami Tyre / zeeshan jahngir', '83946fdb-913e-469b-8286-da0a43eef40a'),
  ('2026-01-04', 1, 10000, 'Awami Tyre / zeeshan jahngir', '7c98ecb1-f597-4e0e-b2da-761066d2cd16'),
  ('2026-01-04', 9, 450, 'Awami Tyre / zeeshan jahngir', '62478402-0060-485d-9cf3-4f3bf7dd69c5'),
  ('2026-01-22', 1, 8425, 'Alnawaz Trader / Azam', '755dbe1f-59e6-479a-9e1b-25d42afdf8fc'),
  ('2026-01-04', 20, 8249.53, 'Abdullah Tyre DG Khan', '9787e9e8-c742-429c-8ab6-672d118b3daa'),
  ('2026-01-04', 10, 5758.53, 'Abdullah Tyre DG Khan', '14e4322d-ae3f-46c6-93f7-6ce75d7848e8'),
  ('2026-01-04', 5, 9792.53, 'Abdullah Tyre DG Khan', '6136ced7-f6d8-401b-a069-64604cfa57cb'),
  ('2026-01-04', 2, 20230.51, 'Abdullah Tyre DG Khan', '5ea8dcb2-aaa9-4b3b-b750-c67da6c7c365'),
  ('2026-01-04', 2, 21793.69, 'Abdullah Tyre DG Khan', 'b6200ab4-a07b-4b7b-82ad-301877f0bde5'),
  ('2026-01-04', 10, 24435.96, 'Abdullah Tyre DG Khan', 'b8ddade4-5ea1-49b8-8b11-1e7a9767b280'),
  ('2026-01-04', 5, 27491.71, 'Abdullah Tyre DG Khan', '9b79bef5-e9ee-419d-af09-4c2a5ccad8f9'),
  ('2026-01-04', 2, 27229.5, 'Abdullah Tyre DG Khan', 'cd38fc86-868c-4b16-91a5-9c489835c756'),
  ('2026-01-04', 3, 27330.35, 'Abdullah Tyre DG Khan', 'e3ea954a-f596-4c05-a63f-549c485e2acb'),
  ('2026-01-04', 15, 9595.74, 'Abdullah Tyre DG Khan', 'f2e96b80-4387-4573-87d8-8058f15b83e7'),
  ('2026-01-04', 15, 10748.48, 'Abdullah Tyre DG Khan', 'f8e9ef7f-d066-4232-b5d5-92849f8cf7d0'),
  ('2026-01-04', 1, 18391.83, 'Abdullah Tyre DG Khan', '2732e14b-5df8-4f7a-9316-82ef67d3fada'),
  ('2026-01-04', 2, 43139.29, 'Abdullah Tyre DG Khan', '749d275a-7863-494f-a2b0-f61350f72c87'),
  ('2026-01-04', 3, 36212.5, 'Abdullah Tyre DG Khan', '81ed8e75-ab20-44cf-a44f-5fec34eb4817'),
  ('2026-01-04', 40, 13161.6, 'Abdullah Tyre DG Khan', '1983b098-4648-4731-9b71-37f13a3f66fa'),
  ('2026-01-22', 6, 8090.33, 'Olampia Traders / Haseeb', '912bd918-ddc9-4876-91ae-966849564a93'),
  ('2026-01-22', 6, 21500, 'Hassan Iqbal Lahore', '7c956b3d-9761-4e6c-a56e-d48baf02e373'),
  ('2026-01-22', 2, 24000, 'Hassan Iqbal Lahore', '4b9aef90-ef27-4226-9f30-79cee5eee161'),
  ('2026-01-22', 4, 18000, 'Hassan Iqbal Lahore', 'c0880ea5-1577-4653-a9bc-1488d080bb2a'),
  ('2026-01-22', 2, 19500, 'Hassan Iqbal Lahore', '7c5511df-0e58-46e0-9c6b-fd3f19f5555c'),
  ('2026-01-22', 4, 29000, 'Hassan Iqbal Lahore', 'ebf2f98f-bd93-4be3-88ba-161f1c4d825a'),
  ('2026-01-22', 1, 23000, 'Hassan Iqbal Lahore', '3f5b899c-936e-435e-9a7b-45666368c3e8'),
  ('2026-01-24', 12, 10000, 'Imran STD / Hifly', 'debe613b-acc6-4b30-86f9-0e5e327768b4'),
  ('2026-01-24', 7, 7500, 'Imran STD / Hifly', 'c3481f95-aee1-4424-a73b-647c5e87a8d3'),
  ('2026-01-24', 5, 7600, 'Imran STD / Hifly', '8cc796cb-0fea-44bf-bd08-f927e9231474'),
  ('2026-01-24', 5, 13200, 'Imran STD / Hifly', '08ba13da-1020-4e93-835a-a0f62c166419'),
  ('2026-01-24', 10, 19200, 'Imran STD / Hifly', '6e3550b1-f576-4504-a176-f901ede9a37b'),
  ('2026-01-24', 12, 10000, 'Imran STD / Hifly', '44bcb919-3087-40a1-bee2-4c878a47c8a5'),
  ('2026-01-24', 7, 7500, 'Imran STD / Hifly', '7391a53b-e4be-4336-a1a2-6ad3599ed45f'),
  ('2026-01-24', 5, 7600, 'Imran STD / Hifly', '5a532794-c35e-4c39-a0d5-bca05f104b36'),
  ('2026-01-24', 5, 13200, 'Imran STD / Hifly', 'ca9ba2b6-35b4-4d6c-b57f-5d5545eb0ce8'),
  ('2026-01-24', 10, 19200, 'Imran STD / Hifly', 'eca98337-bf98-457c-ab5c-3b0f6addd04d'),
  ('2026-01-19', 4, 22500, 'Hassan Iqbal Lahore', '3779c250-6634-4826-ad68-0e7878b62888'),
  ('2026-01-19', 8, 17800, 'Hassan Iqbal Lahore', '78d7303a-ff6f-409b-ae45-e2e4e9f9f662'),
  ('2026-01-19', 8, 10300, 'Hassan Iqbal Lahore', '06a97e27-a176-4118-9262-f019c6aa3516'),
  ('2026-01-19', 4, 7800, 'Hassan Iqbal Lahore', '1a851397-4f11-4289-b738-619031d9c96a'),
  ('2026-01-22', 2, 17654.5, 'Abdullah Tyre DG Khan', '29ab846d-bbc5-4bf9-9de6-de4ae306f7a6'),
  ('2026-01-22', 2, 17654.5, 'Abdullah Tyre DG Khan', 'ba21f989-aa84-4471-8350-cf2c844620d5'),
  ('2026-01-25', 2, 12500, 'Unknown', '5802e98a-e32f-4828-aa21-d0d444bdd2ca'),
  ('2026-01-26', 1, 22795, 'Unknown', '9302b467-c9cc-4b15-ba23-5f0bcc9da30b'),
  ('2026-01-26', 1, 23000, 'Unknown', 'f30133de-bdeb-4617-a331-77943d8483f9'),
  ('2026-01-25', 12, 21000, 'Abdula waris Tyre / Shazaman', '5f20220a-1b3f-4ce7-9680-2e2ea3af2769'),
  ('2026-01-28', 1, 63970, 'Abdullah Tyre DG Khan', '18be4c97-ef45-4fe8-9435-73717aaa46b8'),
  ('2026-01-27', 5, 1300, 'Irtaza Car Decoration item lahore', '936f01c4-1eb3-41e9-a283-a50ce633c065'),
  ('2026-01-27', 3, 1050, 'Irtaza Car Decoration item lahore', '4ab95765-878b-40c5-b013-2ae1f857960c'),
  ('2026-01-27', 3, 800, 'Irtaza Car Decoration item lahore', '001539da-29b0-4239-b487-7241a93a47ac'),
  ('2026-01-27', 10, 650, 'Irtaza Car Decoration item lahore', 'a2a28f45-80ce-43b2-81c6-1e85a5377b9c'),
  ('2026-01-27', 8, 750, 'Irtaza Car Decoration item lahore', '909a9b1a-71f7-4fc1-830b-150d484b6022'),
  ('2026-01-27', 3, 120, 'Irtaza Car Decoration item lahore', 'be4bf3dd-94a2-494b-8fbc-471a6fe07245'),
  ('2026-01-27', 2, 180, 'Irtaza Car Decoration item lahore', '0c3e5293-7146-4214-9cc9-a6aa174af088'),
  ('2026-01-27', 10, 750, 'Irtaza Car Decoration item lahore', '9d982582-a9fb-42a4-aabb-1c06d263588f'),
  ('2026-01-27', 3, 1050, 'Irtaza Car Decoration item lahore', '79c10b6a-0441-4c18-b982-1cb301b07452'),
  ('2026-01-27', 5, 1250, 'Irtaza Car Decoration item lahore', '9047cf14-21a6-4579-8c12-5683dd6a8f6e'),
  ('2026-01-27', 24, 190, 'Irtaza Car Decoration item lahore', '84db32af-b75d-4dda-891d-961a0702d4a7'),
  ('2026-01-08', 2, 1250, 'Moeez Trader Mats Lahore', '85779154-a843-47d3-aab8-88a9100ac997'),
  ('2026-01-08', 2, 2000, 'Moeez Trader Mats Lahore', 'f5ad8828-a50c-4853-a1a8-24f985330ac7'),
  ('2026-01-08', 2, 2100, 'Moeez Trader Mats Lahore', '6e39e019-f63f-4623-95e2-ef810b7756e7'),
  ('2026-01-08', 2, 2200, 'Moeez Trader Mats Lahore', '422d34d6-061b-40d0-b110-65788d663c53'),
  ('2026-01-08', 2, 2300, 'Moeez Trader Mats Lahore', 'd45744bf-77ef-4320-80a6-7fec2329ac62'),
  ('2026-01-08', 2, 1150, 'Moeez Trader Mats Lahore', '394459d2-5cd4-4f2f-bad9-db08a90d164a'),
  ('2026-01-08', 2, 1150, 'Moeez Trader Mats Lahore', '4bf771b9-5dec-43de-ba10-5049f8973ec7'),
  ('2026-01-08', 2, 1200, 'Moeez Trader Mats Lahore', '452ae9a1-237f-44de-8a77-3cf4c5fc3e19'),
  ('2026-01-08', 2, 2300, 'Moeez Trader Mats Lahore', '19986878-c203-4a80-a305-6db9b9baec67'),
  ('2026-01-08', 2, 2300, 'Moeez Trader Mats Lahore', 'efeab33f-807e-44e6-b13d-565450f24cb4'),
  ('2026-01-08', 2, 1850, 'Moeez Trader Mats Lahore', '06f91d9a-3c59-44c9-a314-3c830cdbd836'),
  ('2026-01-08', 2, 1000, 'Moeez Trader Mats Lahore', '0c4936e2-722e-43ae-b1f8-e0c204b6850e'),
  ('2026-01-08', 2, 2000, 'Moeez Trader Mats Lahore', '9d7048df-68f9-42eb-ac66-b50405d0a508'),
  ('2026-01-08', 3, 2600, 'Moeez Trader Mats Lahore', 'f1cbe870-b4bb-4e24-a251-eb22ae506fa8'),
  ('2026-01-08', 3, 2600, 'Moeez Trader Mats Lahore', 'bb5d7c46-f2b0-40f4-8e37-ae514b85fb9f'),
  ('2026-01-08', 2, 2800, 'Moeez Trader Mats Lahore', '4e7f9dcb-09f7-4639-a264-d1c4219281d5'),
  ('2026-01-08', 2, 2800, 'Moeez Trader Mats Lahore', '266a3ea7-93e5-4bd1-81c3-3cef96d40fef'),
  ('2026-01-08', 2, 2800, 'Moeez Trader Mats Lahore', '03243184-c04b-4d35-92f3-27dc4c0277a2'),
  ('2026-01-08', 2, 3300, 'Moeez Trader Mats Lahore', '5bbe42a5-f58a-496e-ad43-ba74d408160d'),
  ('2026-01-08', 2, 2950, 'Moeez Trader Mats Lahore', 'c60aff6b-61d7-4df2-a45d-38be77b63533'),
  ('2026-01-08', 2, 3100, 'Moeez Trader Mats Lahore', 'c0be26d8-54a0-46eb-a4c5-a07bf81e7df7'),
  ('2026-01-08', 2, 2950, 'Moeez Trader Mats Lahore', '4d3d5c86-2698-495b-b761-a06008ee39f8'),
  ('2026-01-08', 2, 2600, 'Moeez Trader Mats Lahore', 'd65f1acd-bf3c-4dee-85d7-e17fab6d5230'),
  ('2026-01-08', 2, 3000, 'Moeez Trader Mats Lahore', '5b9c6f67-4a58-4162-8fc9-feb37034d96d'),
  ('2026-01-08', 2, 3200, 'Moeez Trader Mats Lahore', '9e7851fa-4916-4ae4-bf17-ab9dae286fae'),
  ('2026-01-08', 2, 3800, 'Moeez Trader Mats Lahore', '6616d761-22e6-45ad-a57d-31d2fdecdd84'),
  ('2026-01-29', 24, 425, 'Nasa Product pakistan battery', '71022af9-7779-4fb0-be6b-b0dda736dbde'),
  ('2026-01-29', 48, 275, 'Nasa Product pakistan battery', '1a937eab-b5ec-45e8-877c-6da48142f5f1'),
  ('2026-01-29', 24, 185, 'Nasa Product pakistan battery', '98bbfa53-e382-43f7-a3a6-95b5d91b417d'),
  ('2026-01-29', 12, 535, 'Nasa Product pakistan battery', '1409540b-a201-49ec-a3a2-b5a3b927fe72'),
  ('2026-01-29', 24, 418, 'Nasa Product pakistan battery', 'd6360a19-5852-46e7-827f-4da4132def0e'),
  ('2026-01-29', 12, 815, 'Nasa Product pakistan battery', 'ec1555b9-0217-4755-82b8-0e74f5609e1a'),
  ('2026-01-29', 12, 830, 'Nasa Product pakistan battery', '12384595-64ff-411d-8ce0-1fe398502cd9'),
  ('2026-01-29', 12, 311, 'Nasa Product pakistan battery', '4e468ab4-12b9-4865-9679-e6c38fc9f7d1'),
  ('2026-01-29', 12, 330, 'Nasa Product pakistan battery', '6ddd0fea-7464-43df-8d9e-f5f531891c1e'),
  ('2026-01-29', 24, 340, 'Nasa Product pakistan battery', 'bb4ac676-03f6-4731-8e5a-e41eb69bdf85'),
  ('2026-01-29', 12, 495, 'Nasa Product pakistan battery', 'd67bdbca-7754-46a7-8d26-793c66d8659e'),
  ('2026-01-31', 8, 20500, 'Abdula waris Tyre / Shazaman', 'd2cc034e-5075-4eb8-bbfd-bade76c91b3e'),
  ('2026-01-20', 4, 27489, 'Trible Battery Multa', 'b47063dd-2f40-4328-95ac-6fbb7be7f41f'),
  ('2026-01-20', 4, 12274.5, 'Trible Battery Multa', '08e534bc-9ed8-40ba-9229-18251b86685a'),
  ('2026-01-20', 5, 4499.25, 'Trible Battery Multa', 'bd4bde12-247f-44d0-8177-bc6e3f582149'),
  ('2026-01-20', 3, 15735.2, 'Trible Battery Multa', '07cbfd99-1b3a-4d13-befb-94c0f21726fa'),
  ('2026-01-19', 4, 34790, 'Alnawaz Trader / Azam', 'a148e9c0-b2dd-44a7-9489-e3555d363ff2'),
  ('2026-01-29', 1, 36723.6, 'Alnawaz Trader / Azam', '060411ab-df39-4792-aa38-1d2393e86532'),
  ('2026-01-31', 5, 15000, 'Trible Battery Multa', '22b0ad91-cf9a-4bf4-bd15-089f637654a6'),
  ('2026-01-31', 5, 24294.2, 'Alnawaz Trader / Azam', '69fbecc0-c77c-47a3-906f-f6bf36b8af09'),
  ('2026-01-31', 2, 24892, 'Alnawaz Trader / Azam', 'fd30a827-ddb0-4e39-bce9-d7736b067433'),
  ('2026-01-31', 1, 29988, 'Alnawaz Trader / Azam', '3968f986-1d81-4e3b-937d-3d9454a245a2'),
  ('2026-01-31', 5, 7840, 'Alnawaz Trader / Azam', '4bb7ba49-961e-4da6-beaa-edb9fceb1c7a'),
  ('2026-01-31', 2, 17346, 'Alnawaz Trader / Azam', '4a731dfb-7bc1-4c42-a26c-fbeb4402a16d'),
  ('2026-01-31', 9, 12201, 'Alnawaz Trader / Azam', 'ae15e1b1-0d9b-4a13-9411-4b33a500e57b'),
  ('2026-01-31', 7, 20834.8, 'Alnawaz Trader / Azam', '2a2b40b4-a3fb-498a-9dc1-e9f59624f4b2'),
  ('2026-01-31', 9, 23030, 'Alnawaz Trader / Azam', '3449e9b4-2dae-499b-b27d-65d2a63710e6'),
  ('2026-01-31', 6, 7217.7, 'Alnawaz Trader / Azam', 'a0f006b5-97ed-468d-aed4-f1a85287ff9e'),
  ('2026-01-31', 4, 8962.1, 'Alnawaz Trader / Azam', 'a9dff78c-161e-4ed7-92b4-c5c548b882bb'),
  ('2026-01-31', 2, 36723.6, 'Alnawaz Trader / Azam', '58b5b33b-5ed8-417b-8b3f-944b75dc486b'),
  ('2026-01-31', 2, 24300.6, 'Alnawaz Trader / Azam', '2c812001-bcb3-46ec-bc80-96011461b9dd'),
  ('2026-01-31', 2, 17574, 'Alnawaz Trader / Azam', '83e63de6-82ff-4bf1-865d-a4207d1fc215'),
  ('2026-01-31', 2, 25795.4, 'Alnawaz Trader / Azam', 'a5c0aa1e-b1e2-4567-94e6-feb8ad733629'),
  ('2026-01-31', 5, 7635.6, 'Alnawaz Trader / Azam', '5bd6af80-5594-4d21-8e56-1eae733b5cd3'),
  ('2026-02-02', 10, 40000, 'Rauf Tyre karachi', 'e71527f5-e729-441a-bbff-3e8361ce607c'),
  ('2026-02-02', 10, 14250, 'Rauf Tyre karachi', '3513ecef-0aea-4d68-b1a6-1b5a11fb0f1d'),
  ('2026-02-02', 6, 16500, 'Rauf Tyre karachi', '59da13a3-4dfe-4c37-bd46-570a8807e3f1'),
  ('2026-02-02', 10, 40000, 'Rauf Tyre karachi', 'f401475c-e51a-4142-bceb-5e93732a6edf'),
  ('2026-02-02', 10, 14250, 'Rauf Tyre karachi', '7036e353-48a4-4278-9d1c-e8cde8648ef8'),
  ('2026-02-02', 6, 16500, 'Rauf Tyre karachi', '063ac10d-6c69-466d-b245-201cd13d2dfb'),
  ('2026-01-25', 4, 43139.29, 'Abdullah Tyre DG Khan', 'a9aa1f70-48ba-4cfb-841e-a70c09ba18b6'),
  ('2026-01-25', 2, 36212.5, 'Abdullah Tyre DG Khan', 'fb18b35b-5182-4e9f-b585-700be104161a'),
  ('2026-01-25', 2, 28330.28, 'Abdullah Tyre DG Khan', '3836dcf9-eaa1-4efc-a381-7079f136c713'),
  ('2026-01-25', 10, 5758.53, 'Abdullah Tyre DG Khan', '9e32debb-ea75-4a3b-92c6-ae85ddd45035'),
  ('2026-01-25', 5, 20381.78, 'Abdullah Tyre DG Khan', '0a997b63-3bfe-41aa-be8c-00212fd176ef'),
  ('2026-01-25', 3, 27229.5, 'Abdullah Tyre DG Khan', '60de04f8-bfce-4bf4-8fb3-e222f817c43d'),
  ('2026-01-25', 5, 11849.88, 'Abdullah Tyre DG Khan', 'af4ae81c-34e2-4dce-a7d6-57d92e7720ec'),
  ('2026-01-25', 10, 9792.53, 'Abdullah Tyre DG Khan', '26638fca-b4a4-4a20-b329-c8ef9396b41c'),
  ('2026-01-25', 7, 27491.71, 'Abdullah Tyre DG Khan', '15797e12-e0c2-4374-8a4f-71970afc5856'),
  ('2026-01-25', 10, 9595.74, 'Abdullah Tyre DG Khan', '7cb927ac-4ee0-4611-9d00-97bf2e1131a0'),
  ('2026-01-25', 10, 10748.48, 'Abdullah Tyre DG Khan', 'abaf3ad8-db03-4276-b4d2-ea0105f5a7ef'),
  ('2026-01-25', 10, 12617.77, 'Abdullah Tyre DG Khan', '0a5f6cce-943d-4c1b-aecd-2d0ec1715f1c'),
  ('2026-01-25', 10, 8249.53, 'Abdullah Tyre DG Khan', 'ade5a585-b315-4eb0-b5f6-c0a36a99d396'),
  ('2026-01-25', 1, 20157.28, 'Abdullah Tyre DG Khan', 'b4936961-d0eb-4a6e-9f4a-0756e6228555'),
  ('2026-01-25', 2, 20230.51, 'Abdullah Tyre DG Khan', '0a34cf6d-3cbc-4003-8a75-cd09d97b2575'),
  ('2026-01-25', 2, 21591.99, 'Abdullah Tyre DG Khan', 'b7b94c9a-0fe8-4af4-9db9-ba75726c65f2'),
  ('2026-01-25', 1, 17654.5, 'Abdullah Tyre DG Khan', '0cdc063e-5932-4aa1-8943-c25dab7b2430'),
  ('2026-01-25', 2, 18391.83, 'Abdullah Tyre DG Khan', '926d4538-5da2-44b6-bd21-768e2f84de9c'),
  ('2026-01-31', 4, 24234.26, 'Abdullah Tyre DG Khan', 'bf0b20a0-c6b0-4c4f-ac97-09a42cae3531'),
  ('2026-01-31', 4, 24435.96, 'Abdullah Tyre DG Khan', '00878d62-e7c9-47fd-bc86-4379b71bbfb4'),
  ('2026-01-31', 2, 24093.06, 'Abdullah Tyre DG Khan', '81b8d90e-193e-4bc1-81b2-2cb4fda8cf5d'),
  ('2026-02-15', 6, 7700, 'Olampia Traders / Haseeb', '053a8dc9-ea5f-48a7-a00d-ab94e553005a'),
  ('2026-02-15', 4, 28000, 'Olampia Traders / Haseeb', '87684a6f-edb8-42b2-8bd5-282a9b456a22'),
  ('2026-02-15', 3, 36212.5, 'Abdullah Tyre DG Khan', '8e955d08-88c1-442b-8207-241c0efde94f'),
  ('2026-02-16', 10, 17052, 'Alnawaz Trader / Azam', 'b94e1113-cfac-4f6d-ac82-a00dcece7b74'),
  ('2026-02-16', 15, 23030, 'Alnawaz Trader / Azam', '07f06636-83fd-4597-a25f-fb5a44b9fca4'),
  ('2026-02-16', 5, 26950, 'Alnawaz Trader / Azam', 'a5b8e5ff-0286-4445-8ca6-2d1a760cd37e'),
  ('2026-02-16', 10, 20834.8, 'Alnawaz Trader / Azam', '7a47da6c-ad35-4aaf-a061-5072ca49276c'),
  ('2026-02-16', 5, 7217.7, 'Alnawaz Trader / Azam', '3a4b80d1-6c6c-4dcf-ad2a-82e6a5adf528'),
  ('2026-02-16', 2, 10192, 'Alnawaz Trader / Azam', '6a2999a3-0241-47ad-8d5d-2f7fc2d90f3b'),
  ('2026-02-16', 3, 15332.1, 'Alnawaz Trader / Azam', 'b954db7d-f5a4-409c-bc1c-c955ba6d8d97'),
  ('2026-02-16', 2, 24541.2, 'Alnawaz Trader / Azam', '4283e657-cb11-40fa-a2ee-6b0249d2cdc8'),
  ('2026-02-16', 2, 19247.4, 'Alnawaz Trader / Azam', 'c27b150b-218b-4ce0-8da5-b9b9ca608b41'),
  ('2026-02-16', 1, 30198, 'Trible Battery Multa', '197dfb0c-c800-4f29-9480-6c317c077bab'),
  ('2026-02-17', 15, 40000, 'Abdullah Tyre DG Khan', 'e0a74211-bf17-44df-9119-e0de840f7c53'),
  (default, 1, 19000, 'Unknown', '3952bec9-9db2-4646-899e-67dda5aabb7b'),
  (default, 2, 82000, 'Unknown', 'e0a74211-bf17-44df-9119-e0de840f7c53'),
  ('2026-02-25', 2, 2500, 'Moeez Trader Mats Lahore', '10f7e6cd-1ca4-4a8a-bba2-190c88566e23'),
  ('2026-02-25', 4, 2200, 'Moeez Trader Mats Lahore', '7e17db37-8066-4642-8874-669834f0577e'),
  ('2026-02-25', 2, 1850, 'Moeez Trader Mats Lahore', '5bb34512-1a40-4339-8dcf-57b28a8bf681'),
  ('2026-02-25', 3, 1200, 'Moeez Trader Mats Lahore', '525cd8ea-e6cb-4cd7-83b2-374be49897fc'),
  ('2026-02-25', 2, 1250, 'Moeez Trader Mats Lahore', 'd3fb1d21-c005-4bef-ab0b-31cd15303b57'),
  ('2026-02-25', 2, 1200, 'Moeez Trader Mats Lahore', '6b21e3c1-fc97-422b-b01e-15543c05bd7a'),
  ('2026-02-25', 8, 8640, 'Abdula waris Tyre / Shazaman', '5eb60df7-363a-4782-899b-2b81ac2c714b'),
  ('2026-02-25', 4, 25000, 'Abdula waris Tyre / Shazaman', 'f66093b3-a476-452b-86b3-49dd5e08c1a8'),
  ('2026-02-25', 4, 20000, 'Abdula waris Tyre / Shazaman', '5c50bf4f-a7ad-4666-8d05-43c12b37ad16'),
  ('2026-02-23', 23, 18300, 'Moen Sunfull/ Evergreen Tyre', '13344f5e-9ef0-44b6-bcdb-2a89419a2859'),
  ('2026-02-23', 12, 23200, 'Moen Sunfull/ Evergreen Tyre', '4a343d03-28b8-4b39-a30c-973fcad47248'),
  ('2026-02-23', 1, 12800, 'Moen Sunfull/ Evergreen Tyre', '19e033bd-49c6-4b1d-9c09-dddb37e144b6'),
  ('2026-02-24', 12, 10000, 'Moen Sunfull/ Evergreen Tyre', 'cc12cbc2-3210-4487-9c73-e2c7b226c66a'),
  ('2026-02-25', 10, 9595.74, 'Abdullah Tyre DG Khan', '604c7ae5-4c20-47de-8bd8-7e0c965fc4f5'),
  ('2026-02-25', 10, 10748.48, 'Abdullah Tyre DG Khan', 'b2372e8b-e0a8-426d-b3f5-7cceba3f8939'),
  ('2026-02-25', 2, 20157.28, 'Abdullah Tyre DG Khan', '840bc5a8-a2af-409e-b427-d75244eea2ce'),
  ('2026-02-25', 2, 17654.5, 'Abdullah Tyre DG Khan', 'e4f26de2-1608-44ef-9b78-f7b4f52f3eed'),
  ('2026-02-25', 7, 27100, 'Abdullah Tyre DG Khan', '77759210-2756-41b8-a055-cd03b3745565'),
  ('2026-02-25', 7, 27260, 'Abdullah Tyre DG Khan', 'c0282cfb-818f-4c65-b0ba-2d582346d204'),
  ('2026-02-25', 7, 24230, 'Abdullah Tyre DG Khan', '88373e00-d0d2-43c0-9e7e-0ed2780b2e77'),
  ('2026-02-25', 10, 5710, 'Abdullah Tyre DG Khan', '4b03e3ed-cc40-4e5b-965d-fd3f3c81427c'),
  ('2026-02-25', 10, 7080, 'Abdullah Tyre DG Khan', 'e5e6f749-80b6-4dd9-8c6d-27155a355dee'),
  ('2026-02-25', 10, 8180, 'Abdullah Tyre DG Khan', 'ca01a8aa-944c-4c1e-89b7-89b70a7a817b'),
  ('2026-02-25', 2, 20210, 'Abdullah Tyre DG Khan', 'c5ff6512-9a7f-474b-938d-d2ca35c47d49'),
  ('2026-02-25', 10, 13710, 'Abdullah Tyre DG Khan', 'c38d4ce3-b0f4-4bd5-85e3-1f803dcbbef7'),
  ('2026-02-25', 2, 17140, 'Abdullah Tyre DG Khan', 'b4cdbbef-09bb-4598-a7f4-34f934f17096'),
  ('2026-02-25', 2, 17140, 'Abdullah Tyre DG Khan', '965649a4-5f66-429f-ae55-868369b7e5bf'),
  ('2026-02-25', 4, 34120, 'Abdullah Tyre DG Khan', 'f95a3c56-104d-4dde-96b7-083a7f33fb41'),
  ('2026-02-25', 2, 21410, 'Abdullah Tyre DG Khan', 'bc45a941-10e0-4164-b149-de3789236393'),
  ('2026-02-25', 4, 28330.28, 'Abdullah Tyre DG Khan', 'f81315e6-6000-4c41-a46f-9b31dff895dc'),
  ('2026-02-25', 3, 21320, 'Abdullah Tyre DG Khan', '67c92c9e-062c-4982-a939-3ab980bd5d7a'),
  ('2026-02-25', 7, 9710, 'Abdullah Tyre DG Khan', 'd8d2a03b-1a31-45a8-96ce-649544632f44'),
  ('2026-02-25', 6, 9310, 'Abdullah Tyre DG Khan', '28e127ce-8972-4344-bc9e-2563700c22b9'),
  ('2026-02-25', 3, 21610, 'Abdullah Tyre DG Khan', '7f714219-f456-4cb9-845a-395ed5dbcb97'),
  ('2026-02-25', 2, 32970, 'Trible Battery Multa', 'b6827894-fe19-4a10-b953-ba9eb6f875fa'),
  ('2026-02-25', 5, 10100, 'Lucky Tyre / Umar', 'a606368e-29db-48c1-b9e1-58e515df29af'),
  ('2026-02-25', 4, 8400, 'Lucky Tyre / Umar', '62606cd1-bc75-4ccc-85a9-2763b0b95145'),
  ('2026-02-25', 4, 12200, 'Lucky Tyre / Umar', 'a7e63e96-20fe-4ff9-aac0-821132d92f09'),
  ('2026-02-25', 12, 7800, 'Lucky Tyre / Umar', '3bde9d58-f564-4804-9cd5-74d959e1d18c'),
  ('2026-02-18', 2, 32970, 'Trible Battery Multa', '95de4395-3144-42ca-b688-f7e172f940ba'),
  ('2026-02-26', 4, 51000, 'Hassan Iqbal Lahore', '35686fdb-f208-4ae1-af83-eafc5d51dde1'),
  ('2026-03-03', 2, 29376, 'Alnawaz Trader / Azam', '427980e2-6cb3-4080-910d-350b29f0dfa9'),
  ('2026-03-03', 2, 24300.6, 'Alnawaz Trader / Azam', '7649706f-ad09-4c27-aa28-5eab6f4a4b24'),
  ('2026-03-03', 1, 17574, 'Alnawaz Trader / Azam', '3b64e1f5-f2b9-4948-86e9-5be87ebca8d8'),
  ('2026-03-03', 1, 28128.5, 'Alnawaz Trader / Azam', '97032fcb-c768-4f08-a7af-6fa4606d8bbe'),
  ('2026-03-03', 1, 20856.5, 'Alnawaz Trader / Azam', '55a22c54-52e5-42d1-b7bc-304ff2bfa139'),
  ('2026-03-03', 2, 18096, 'Alnawaz Trader / Azam', '4201addf-01ce-4d20-bb86-d79c8575fbcf'),
  ('2026-03-03', 10, 22560, 'Alnawaz Trader / Azam', '76c73fd2-6bb0-4543-a410-471bf34f8e60'),
  ('2026-03-03', 2, 31872, 'Alnawaz Trader / Azam', '32bd1062-5e31-48c1-b160-694065e53f7e'),
  ('2026-03-03', 5, 11616, 'Alnawaz Trader / Azam', '2b4fb7b4-b13b-45c6-ab25-78835b18bd30'),
  ('2026-03-03', 10, 15000, 'Alnawaz Trader / Azam', '39c929cb-77d5-4932-a562-a6129b6ff2d8'),
  ('2026-03-03', 6, 4473.6, 'Alnawaz Trader / Azam', '3bb3cb57-be62-4122-a1d5-d3a2db95ec6c'),
  ('2026-03-03', 3, 34080, 'Alnawaz Trader / Azam', 'ca75ac23-e887-4535-886f-8473fc53ff66'),
  ('2026-03-03', 6, 16500, 'Awami Tyre / zeeshan jahngir', 'f3a4bde3-0881-418f-bbc8-f546963a20e0'),
  ('2026-03-03', 6, 18500, 'Awami Tyre / zeeshan jahngir', '72d76e18-f21f-4662-8af4-3756ba1ed227'),
  ('2026-03-03', 25, 840, 'Awami Tyre / zeeshan jahngir', 'da03e734-41ae-402a-8196-c9eb6b6b696d'),
  ('2026-03-03', 50, 660, 'Awami Tyre / zeeshan jahngir', '16503174-2cfb-4f64-a860-6fd47b50d48b'),
  ('2026-03-03', 5, 5750, 'Awami Tyre / zeeshan jahngir', '7586ca83-f521-468d-bcde-c4a17f697533'),
  ('2026-03-03', 10, 4850, 'Awami Tyre / zeeshan jahngir', '76022ac5-0f87-4088-a3e1-35dcad5ad77c'),
  ('2026-03-03', 6, 16500, 'Awami Tyre / zeeshan jahngir', '6228db08-05ee-4bd5-b051-fbd9fa210afd'),
  ('2026-03-03', 6, 18500, 'Awami Tyre / zeeshan jahngir', 'e87dcfa3-9a44-418c-9e32-84d327b9882e'),
  ('2026-03-03', 25, 840, 'Awami Tyre / zeeshan jahngir', '9cdd36b3-46bd-4830-bc13-500db12a0e0c'),
  ('2026-03-03', 50, 660, 'Awami Tyre / zeeshan jahngir', 'f7a1b0cd-ef4a-4936-a29d-56f03e143a15'),
  ('2026-03-03', 5, 5750, 'Awami Tyre / zeeshan jahngir', '18decf41-be1f-474b-a00e-f58a1e80cb36'),
  ('2026-03-03', 10, 4850, 'Awami Tyre / zeeshan jahngir', '9c70678e-8f64-4b98-875e-f95ae4b45854'),
  ('2026-03-07', 20, 13500, 'Moen Sunfull/ Evergreen Tyre', '6d890493-ef44-46a5-b6f2-f24b845f903b'),
  ('2026-03-07', 12, 9600, 'Moen Sunfull/ Evergreen Tyre', '14b22c95-4d77-4f7f-9d78-56a298de70fb'),
  ('2026-03-07', 30, 18300, 'Moen Sunfull/ Evergreen Tyre', 'adb54e39-d960-4b3b-a846-0d9884253c47'),
  ('2026-03-07', 12, 20600, 'Moen Sunfull/ Evergreen Tyre', '9e7a6488-0789-449b-b3ad-e5128b272eab'),
  ('2026-03-09', 20, 8180, 'Abdullah Tyre DG Khan', '3f1ed580-9a68-41c7-906e-bae3fb348c51'),
  ('2026-03-09', 4, 28371.2, 'Abdullah Tyre DG Khan', 'c64e862c-31e9-4ed9-b7f2-4dba438d3331'),
  ('2026-03-09', 4, 28371.2, 'Abdullah Tyre DG Khan', '3fecabe4-2640-4f0b-9f41-16c316bcfd23'),
  ('2026-03-09', 2, 29260, 'Abdullah Tyre DG Khan', '93760dbf-5458-4aa2-b7be-d9e4ab20cb02'),
  ('2026-03-09', 20, 8180, 'Abdullah Tyre DG Khan', '87dc1e9a-a884-469d-a225-4d85fd691bc8'),
  ('2026-03-09', 4, 28371.2, 'Abdullah Tyre DG Khan', '89205643-85a2-4d79-9d50-0e7ea6663a97'),
  ('2026-03-09', 4, 28371.2, 'Abdullah Tyre DG Khan', '9110cfff-ecb0-4ef7-bcd6-a628330fa81d'),
  ('2026-03-09', 2, 29260, 'Abdullah Tyre DG Khan', '0c68da21-c4b8-4248-8c65-d2ea4e10db9d'),
  ('2026-03-10', 1, 43002.08, 'Trible Battery Multa', 'bbf408c6-c9b9-4bae-a38b-85866e61a65b'),
  ('2026-03-10', 4, 33198.54, 'Trible Battery Multa', '2608c571-603c-4b21-922e-7372a565198e'),
  ('2026-03-16', 2, 41000, 'Awami Tyre / zeeshan jahngir', 'b32c2d95-320f-4e94-a059-7e47155f0164'),
  ('2026-03-16', 4, 29260, 'Abdullah Tyre DG Khan', '3b4a67a4-113e-4845-ad25-f5878a87988f'),
  ('2026-03-02', 4, 20000, 'Abdula waris Tyre / Shazaman', '545bb905-2000-43c9-b90d-88799a5b9a0a'),
  ('2026-03-02', 4, 16000, 'Abdula waris Tyre / Shazaman', '49ed3a45-fa98-4208-bdcb-3b5742ee3bfb'),
  ('2026-03-06', 6, 39200, 'Abdula waris Tyre / Shazaman', 'f1a8fb87-defe-41a0-b7f7-d28fb8fcee72'),
  ('2026-03-06', 4, 9800, 'Abdula waris Tyre / Shazaman', '6b4e61cf-3336-4c4f-86c8-7775bbaad86a'),
  ('2026-03-17', 12, 535, 'Nasa Product pakistan battery', '8baa8cee-cb56-41cb-84b4-ba5275f147e3'),
  ('2026-03-16', 12, 9955, 'Abdullah Tyre DG Khan', '331f1693-fd53-4e4b-b154-47bb04f6eed2'),
  ('2026-03-16', 8, 10590, 'Abdullah Tyre DG Khan', 'f27cba38-ae32-4fb9-a1b2-426752cbba8a'),
  ('2026-03-16', 8, 10900, 'Abdullah Tyre DG Khan', '4d0720d8-4aa3-4049-adb3-5f2e8e8bac9f'),
  ('2026-03-16', 4, 13860, 'Abdullah Tyre DG Khan', '7934e82f-0f95-4815-b4f7-7a9c082a6a02'),
  ('2026-03-16', 8, 13750, 'Abdullah Tyre DG Khan', '295ad389-5368-4814-8518-2a596d6395b4'),
  ('2026-03-16', 12, 14190, 'Abdullah Tyre DG Khan', '263b1ffa-68af-40bd-8a08-842c1ce0e9c1'),
  ('2026-03-04', 1, 32000, 'Multan Tyre Center / MTC Waseem Sb', 'ef58d318-7b78-4f6e-a202-ac9db9e4fbb5'),
  ('2026-03-04', 4, 28000, 'Multan Tyre Center / MTC Waseem Sb', '8263b9b3-433e-4d1e-813a-f6e27af84e12'),
  ('2026-03-01', 2, 28000, 'Multan Tyre Center / MTC Waseem Sb', '17b3c7a2-590a-4447-9b46-df17b216a6f3'),
  ('2026-03-01', 1, 15500, 'Multan Tyre Center / MTC Waseem Sb', '8155e693-c6cf-4145-a01b-9d67bd059ef5'),
  ('2026-03-30', 1, 800, 'Unknown', '16503174-2cfb-4f64-a860-6fd47b50d48b'),
  ('2026-03-29', 10, 37800, 'Rahet Battery / Mubashar', '5948bb65-a96f-4a0a-a4cd-fe2ad2bdd8a7'),
  ('2026-03-29', 20, 25462.5, 'Rahet Battery / Mubashar', '0dbc48f1-1613-4e83-af4e-7b12d0d95c09'),
  ('2026-03-29', 10, 22575, 'Rahet Battery / Mubashar', '86187ebf-3e86-49bc-853b-ae86c892d537'),
  ('2026-03-29', 10, 29767.5, 'Rahet Battery / Mubashar', '598a367e-9510-4799-9f1e-f281063f7855'),
  ('2026-03-29', 4, 35385, 'Rahet Battery / Mubashar', '2fce32da-c71b-46c1-a69e-930622586186'),
  ('2026-03-29', 5, 13755, 'Rahet Battery / Mubashar', '16a28d66-b6d1-4485-9698-18d928bdfc26'),
  ('2026-03-29', 10, 7749, 'Rahet Battery / Mubashar', 'e660a00f-3e03-47ad-a473-a7170622e948'),
  ('2026-03-29', 20, 7600, 'Olampia Traders / Haseeb', '4ae2d697-d0a4-466a-9b18-467b3a384316'),
  ('2026-03-29', 8, 2625, 'Olampia Traders / Haseeb', 'f9296ab7-8b55-4f38-8bea-a2e04665d6f3'),
  ('2026-03-28', 5, 19834, 'Daewoo Battery / Talha', 'b3311fe9-386d-4582-adea-53208119efbe'),
  ('2026-03-28', 5, 31650, 'Daewoo Battery / Talha', 'f5107e9b-183a-4a07-886a-da3618156a9b'),
  ('2026-03-28', 10, 9000, 'Daewoo Battery / Talha', '8969685c-66e1-47c5-aa14-a3e58a367d7b'),
  ('2026-03-28', 10, 10150, 'Daewoo Battery / Talha', '40d2c8dd-dcbc-4ffe-803c-ec2a054218c5'),
  ('2026-03-28', 5, 11500, 'Daewoo Battery / Talha', 'c8eda9c3-a557-4b57-adc2-18a0591ce0a6'),
  ('2026-03-28', 5, 12000, 'Daewoo Battery / Talha', '745a7d48-dbdf-4913-975a-f9ee58d84e9b'),
  ('2026-03-28', 6, 12376, 'Daewoo Battery / Talha', '919bcaaa-6592-4836-a07e-bac74d23b05a'),
  ('2026-03-28', 5, 17724, 'Daewoo Battery / Talha', 'c13f90ad-5390-47fc-b01f-0f64dd46ab6d'),
  ('2026-03-28', 5, 22500, 'Daewoo Battery / Talha', '85285207-973e-48c0-927e-1e511a98e3f5'),
  ('2026-03-28', 6, 21627.5, 'Daewoo Battery / Talha', 'bb3f66aa-6211-4724-b2e2-82b9a40b386b'),
  ('2026-04-01', 6, 21627.5, 'Daewoo Battery / Talha', 'b8fdd5fe-85ef-44a9-ac80-47583f392830'),
  ('2026-04-01', 5, 19517.5, 'Daewoo Battery / Talha', '9e0f6268-1efc-45d5-83d5-74bd6dc1e142'),
  ('2026-03-05', 4, 12000, 'Awami Tyre / zeeshan jahngir', '4d1e494b-0e3a-4492-bcd8-72659172490c'),
  ('2026-03-05', 4, 7900, 'Awami Tyre / zeeshan jahngir', '95c814ba-0c59-4bae-89d3-722a2f80912a'),
  ('2026-03-05', 2, 17900, 'Awami Tyre / zeeshan jahngir', '9710c7a2-af38-4420-96a3-3d6e8b539779'),
  ('2026-03-05', 4, 8200, 'Awami Tyre / zeeshan jahngir', '9829e0fb-8e46-4583-a75c-8c144166f79c'),
  ('2026-03-29', 10, 18100, 'Awami Tyre / zeeshan jahngir', '23f05eac-7f6d-4c31-9bdb-8949ee506c14'),
  ('2026-03-29', 10, 6950, 'Awami Tyre / zeeshan jahngir', 'f263e4c5-b8e4-4451-bfe0-b6a28f5ef035'),
  ('2026-03-29', 4, 8900, 'Awami Tyre / zeeshan jahngir', '022b69ac-d1c4-43bf-bed2-bd7d1bcbd3d4'),
  ('2026-03-29', 4, 10100, 'Awami Tyre / zeeshan jahngir', '12997f6b-87a2-4b15-a838-a1ddb9a9a943'),
  ('2026-03-29', 6, 18500, 'Awami Tyre / zeeshan jahngir', '65b4d066-a2b4-4019-85df-10898e913749'),
  ('2026-03-29', 6, 16500, 'Awami Tyre / zeeshan jahngir', '1464790a-d503-471f-b5ca-111c3ea01ab6'),
  ('2026-04-02', 10, 19500, 'Hassan Iqbal Lahore', 'c9c81355-a3da-4c1e-a127-f36eb2725283'),
  ('2026-04-30', 10, 25462.5, 'Rahet Battery / Mubashar', 'a546bc43-9922-46c4-96c6-7c01022375fa'),
  ('2026-04-30', 10, 13755, 'Rahet Battery / Mubashar', '37ac0e18-be52-4abb-9b1f-cf04a6c76d76'),
  ('2026-04-30', 5, 20317.5, 'Rahet Battery / Mubashar', '9da0b290-3610-4405-a42e-4903289070f3'),
  ('2026-04-04', 50, 18300, 'Moen Sunfull/ Evergreen Tyre', '601f6001-24c9-4fcc-94a9-caef0d01effd'),
  ('2026-04-04', 12, 17500, 'Moen Sunfull/ Evergreen Tyre', '5c579c93-68de-4556-b31e-fcf43cb2f917'),
  ('2026-04-06', 2, 36613.5, 'Abdullah Tyre DG Khan', '9f892823-0005-4421-aec9-a116f8db2ab7'),
  ('2026-04-04', 14, 22300, 'Moen Sunfull/ Evergreen Tyre', '73b6077a-d6c3-4857-b28b-60283eee95d8'),
  ('2026-04-04', 6, 10000, 'Moen Sunfull/ Evergreen Tyre', '5c96f9f1-637a-4e87-a95f-df74934be8d2'),
  ('2026-04-07', 22, 29256, 'Daewoo Battery / Talha', 'c0222f57-cede-45ba-b6a9-dfaadb8434ce'),
  ('2026-04-07', 15, 26606, 'Daewoo Battery / Talha', 'da2c837e-5093-456e-ba8f-0d1a8e758cb3'),
  ('2026-04-07', 5, 9000, 'Daewoo Battery / Talha', '70337855-90eb-4dec-bd02-34d7b9391068'),
  ('2026-04-07', 6, 12376, 'Daewoo Battery / Talha', '225467a0-1b90-49cc-964d-8453a7115058'),
  ('2026-04-09', 2, 34461.2, 'Abdullah Tyre DG Khan', '998b3c1d-39c9-448d-8b9c-a26ab06ca19e'),
  ('2026-04-09', 8, 10000, 'Hanzala iqbal / Zmax Tyre', 'ed24f7e3-6c58-4c73-9c0d-81e80a4a5754'),
  ('2026-04-09', 8, 10000, 'Hanzala iqbal / Zmax Tyre', '4993e3f3-4b6e-455c-8e35-5824852f9e3a'),
  ('2026-04-07', 10, 40984, 'Phoenix Battery  Dealership', '5356a69c-fa43-4999-884e-3193556770d3'),
  ('2026-04-07', 5, 23347.8, 'Phoenix Battery  Dealership', 'b65409e9-fa25-4172-b4b2-4789eee1feae'),
  ('2026-04-07', 5, 14333.5, 'Phoenix Battery  Dealership', '8f195b81-ab8d-4e39-84fa-babdd1dda395'),
  ('2026-04-07', 15, 26879.4, 'Phoenix Battery  Dealership', 'fe78011d-ea9e-4397-9ba7-45a40fb71cfa'),
  ('2026-04-07', 5, 27740.5, 'Phoenix Battery  Dealership', 'b6df8bf1-e1f0-48b0-b04c-8c6eadd48728'),
  ('2026-04-07', 5, 28263.7, 'Phoenix Battery  Dealership', '4b4cb195-a0ad-4ca3-9762-331c9aec9a7a'),
  ('2026-04-07', 5, 30814.3, 'Phoenix Battery  Dealership', '19be90ab-01be-44d7-9579-186520975363'),
  ('2026-04-07', 5, 31043.2, 'Phoenix Battery  Dealership', '8b23d8d5-2846-4ab0-af30-ce92071e2563'),
  ('2026-04-16', 6, 14333.5, 'Phoenix Battery  Dealership', '7b9500ff-3469-4a35-9dbf-e165ff9245c7'),
  ('2026-04-16', 10, 17211.1, 'Phoenix Battery  Dealership', 'dab45850-cf30-42e7-b8fb-6a441b4c91a4'),
  ('2026-04-16', 5, 26879.4, 'Phoenix Battery  Dealership', 'c5034efb-62d4-4969-bb99-6e8afff0265b'),
  ('2026-04-16', 2, 31043.2, 'Phoenix Battery  Dealership', '220e42e7-f08f-425c-a947-143bfd58ad10'),
  ('2026-04-16', 4, 40984, 'Phoenix Battery  Dealership', '3bd5d632-4725-4b74-b02c-e10e1e2edb30'),
  ('2026-04-12', 4, 8800, 'Lucky Tyre / Umar', 'b762d787-6016-4548-86a0-599d0e2848d9'),
  ('2026-04-12', 5, 10800, 'Lucky Tyre / Umar', 'c537a768-43ae-4d88-ae9a-289472e7955b'),
  ('2026-04-12', 4, 12500, 'Lucky Tyre / Umar', '0bf930cd-b528-4d02-baa9-663fd39a4ba3'),
  ('2026-04-18', 1, 1364, 'Abdullah Tyre DG Khan', '51b0a732-ffdf-45ba-9ad9-16e6941d5777'),
  ('2026-04-17', 2, 38892.8, 'Abdullah Tyre DG Khan', '0691aa51-b4c7-407c-84d5-1078a818f8f2'),
  ('2026-04-17', 1, 37310.9, 'Abdullah Tyre DG Khan', '4362be53-75ba-4e2b-b58c-9aa7e88fde61'),
  ('2026-04-18', 6, 29942.1, 'Abdullah Tyre DG Khan', '4771bc7d-85ec-4440-be28-2c13ba034392'),
  ('2026-04-18', 4, 27913, 'Abdullah Tyre DG Khan', '118a1aa0-8493-4d5e-8c59-95fedb59841d'),
  ('2026-04-18', 6, 29880.3, 'Abdullah Tyre DG Khan', '9923f8f3-b5f7-4269-9a82-03263c4f4616'),
  ('2026-04-18', 4, 27810, 'Abdullah Tyre DG Khan', 'cd3c839b-661f-4e2d-9db3-b51afdc84982'),
  ('2026-04-18', 4, 28077.8, 'Abdullah Tyre DG Khan', '6edc46ab-696e-4633-aafa-30b0ca1708fa'),
  ('2026-04-18', 2, 22052.3, 'Abdullah Tyre DG Khan', 'eee22968-4f91-4592-9ac0-ad7377865171'),
  ('2026-04-18', 6, 24606.7, 'Abdullah Tyre DG Khan', '8fce8e8f-a798-4c3a-a7ec-c2df77845559'),
  ('2026-04-20', 2, 39648, 'Abdullah Tyre DG Khan', '6f3f701d-2763-4770-94b1-6ec653c381d9'),
  ('2026-04-13', 20, 9656.35, 'Abdullah Tyre DG Khan', '144e27a8-16f9-4365-aff6-47bc990e9c0d'),
  ('2026-04-13', 20, 10573, 'Abdullah Tyre DG Khan', 'a389351d-0eb9-4680-971e-f4a8c06ae8ee'),
  ('2026-04-13', 4, 10272.3, 'Abdullah Tyre DG Khan', '92ae665b-6ad6-4079-9fdb-c82fc4e51ce1'),
  ('2026-04-13', 4, 16005, 'Abdullah Tyre DG Khan', '552c2a76-7b80-48f8-8745-3e73b0222cda'),
  ('2026-04-13', 4, 13337.5, 'Abdullah Tyre DG Khan', 'bb8a43a0-3b5c-45f3-b44b-57226c2e713d'),
  ('2026-04-13', 4, 19569.75, 'Abdullah Tyre DG Khan', '4c25935b-88ef-4c1d-b53e-c06b512e20e6'),
  ('2026-04-13', 6, 1540, 'Nasa Product pakistan battery', '5c95bfaa-5f9d-490c-8369-9c8021b10857'),
  ('2026-04-21', 15, 41800, 'Abdullah Tyre DG Khan', '2672b131-8f44-4e90-8d01-caf8d08f811e'),
  ('2026-04-22', 15, 14333.5, 'Phoenix Battery  Dealership', 'c00a0ff5-2e10-4924-9457-6e5e57a88f27'),
  ('2026-04-22', 4, 26879.4, 'Phoenix Battery  Dealership', 'f894b3a9-740f-4a35-9dee-b17440eb16ba'),
  ('2026-04-22', 5, 27740.5, 'Phoenix Battery  Dealership', '6ddffdf7-4d73-48d9-9ff5-2df5da991b40'),
  ('2026-04-22', 6, 30814.3, 'Phoenix Battery  Dealership', 'd36ae3c2-95e3-4e75-b00d-4378dbf570a9'),
  ('2026-04-22', 2, 31043.2, 'Phoenix Battery  Dealership', '45df22c4-0682-45f0-b060-f4b27b80d9d6'),
  ('2026-04-22', 4, 40984, 'Phoenix Battery  Dealership', '4569d3f9-5fe3-4eab-9660-24eee16f0487'),
  ('2026-04-19', 5, 24241.25, 'Daewoo Battery / Talha', 'f5ccad4f-785c-47ea-9df6-4ca030610437'),
  ('2026-04-19', 4, 22252.5, 'Daewoo Battery / Talha', '534ff255-7f8d-4364-90a1-b19741516967'),
  ('2026-04-19', 10, 21876.25, 'Daewoo Battery / Talha', '3d710f19-97a5-427b-bfe3-63fa39065f09'),
  ('2026-04-19', 10, 5510, 'Rahet Battery / Mubashar', 'fd90ccde-1f30-409b-bd16-4995551c1a1d'),
  ('2026-04-19', 25, 13700, 'Rahet Battery / Mubashar', '12745b60-6dc2-43bd-b4fb-b4235d75002a'),
  ('2026-04-19', 5, 12150, 'Rahet Battery / Mubashar', '8bd46d4d-958c-4e79-8dd3-92161e24dc01'),
  ('2026-04-23', 15, 32626.25, 'Daewoo Battery / Talha', 'ec134c11-6a1a-431d-a03c-d71771efa2bd'),
  ('2026-04-23', 6, 36227.5, 'Daewoo Battery / Talha', 'bab6dbdf-d63d-48bc-bb99-0e64a85abda7'),
  ('2026-04-23', 13, 13780, 'Daewoo Battery / Talha', 'f53285b7-5bef-4b4c-9f9d-f4ef9b9539af'),
  ('2026-04-26', 4, 40984, 'Phoenix Battery  Dealership', '7bb9e818-267d-406e-b115-f0ed2c383c87'),
  ('2026-04-26', 4, 19173.1, 'Phoenix Battery  Dealership', '9d853373-6636-4718-ae35-aa4bc874ced5'),
  ('2026-04-26', 10, 14333.5, 'Phoenix Battery  Dealership', '15027660-18eb-43c1-8aec-7c008cc01b04'),
  ('2026-04-26', 2, 36700.3, 'Phoenix Battery  Dealership', '7e0984f6-1159-412a-a111-ea9ee191fe74'),
  ('2026-04-26', 2, 30814.3, 'Phoenix Battery  Dealership', '83ab579e-0efc-4a3a-81f6-1d55e847d6a5'),
  ('2026-04-26', 2, 15292.7, 'Phoenix Battery  Dealership', '41a2dff0-5ac4-4328-943e-eb73630eafb4'),
  ('2026-04-26', 2, 20982.5, 'Phoenix Battery  Dealership', 'eefa8cf0-b655-49cb-9407-c7281ddb05c7'),
  ('2026-04-26', 2, 17167.5, 'Phoenix Battery  Dealership', '72810f65-3a30-4039-9960-902069304cf2'),
  ('2026-04-26', 6, 26879.4, 'Phoenix Battery  Dealership', 'ef21fe7c-ad87-4e23-b701-51c43242119d'),
  ('2026-04-26', 2, 27740.5, 'Phoenix Battery  Dealership', 'ba6310ca-94f4-46b3-af0e-85241c6435b1'),
  ('2026-04-26', 2, 23347.8, 'Phoenix Battery  Dealership', 'd6329f5e-beb8-4226-b871-4a0e8952e7c5'),
  ('2026-04-18', 10, 5510, 'Rahet Battery / Mubashar', '8dac3eff-0cac-484e-bff7-f782ecef1f8b'),
  ('2026-04-18', 25, 13700, 'Rahet Battery / Mubashar', 'da914e47-54cc-4815-a5de-0e39006f75ea'),
  ('2026-04-18', 5, 12150, 'Rahet Battery / Mubashar', 'd6d2a73b-8fba-4d87-b2b2-431b4418821e'),
  ('2026-04-23', 10, 8507.2, 'Rahet Battery / Mubashar', 'c674afe8-e7fc-4796-912a-428bf5cc7de8'),
  ('2026-04-23', 3, 21018.4, 'Rahet Battery / Mubashar', 'a0c38861-e12f-46b7-a5d6-3cfc8dc045d0'),
  ('2026-04-23', 5, 22474.4, 'Rahet Battery / Mubashar', '41208969-4c8d-490e-9199-20935bc3af2f'),
  ('2026-04-23', 5, 35484.8, 'Rahet Battery / Mubashar', '4faf5dc6-d47a-4e2c-a47c-2c1d4a58bc60'),
  ('2026-04-23', 20, 27500, 'Rahet Battery / Mubashar', 'a5b6655f-1751-45db-bc14-5ec57342306d'),
  ('2026-04-23', 2, 30000, 'Rahet Battery / Mubashar', '0a3afb05-dd96-4a93-87e4-598d09019a6b'),
  ('2026-04-23', 5, 24500, 'Rahet Battery / Mubashar', '3709ba0b-afb4-4973-b80f-a646d54ae07b'),
  ('2026-04-23', 5, 23000, 'Rahet Battery / Mubashar', '3d77fc64-e7a2-47d0-acbe-85d9b79410d8'),
  ('2026-04-23', 4, 40500, 'Rahet Battery / Mubashar', '1b87a22c-0b2b-4ae1-8e8b-8674811bd83c'),
  ('2026-04-04', 30, 7500, 'Imran STD / Hifly', 'fca02c3c-6ea5-40f8-91d4-d4dac39edf5f'),
  ('2026-04-04', 8, 13000, 'Imran STD / Hifly', '8c038efc-0556-46b0-85e7-de715a4cc541'),
  ('2026-04-04', 4, 15000, 'Imran STD / Hifly', '209eb606-ae3e-4245-9e4e-af065f09e63a'),
  ('2026-04-04', 20, 9300, 'Imran STD / Hifly', 'd72cbcaf-e7ff-47b3-892b-de309b1644bc'),
  ('2026-04-27', 12, 22300, 'Moen Sunfull/ Evergreen Tyre', 'ae27dcd0-ddcb-4015-9816-aa7e9c43b72b'),
  ('2026-04-27', 6, 18500, 'Moen Sunfull/ Evergreen Tyre', 'b5568c29-f8c3-46c6-b85e-4e4a73a01b29'),
  ('2026-04-27', 10, 17500, 'Moen Sunfull/ Evergreen Tyre', '6f00b698-8e33-48b5-b3ca-e9663e11bfd4'),
  ('2026-05-04', 5, 22252.5, 'Daewoo Battery / Talha', '984b20a3-61f4-4ddd-8819-cd7457f45819'),
  ('2026-05-04', 5, 29670, 'Daewoo Battery / Talha', '9417b7e9-bef5-4b2d-b4f9-fdfdb9035a02'),
  ('2026-05-04', 3, 17482.5, 'Daewoo Battery / Talha', '36996727-922f-47bf-a862-441a855a6dd8'),
  ('2026-05-04', 2, 18585, 'Daewoo Battery / Talha', '2135300e-86f6-432b-84fe-502a953a458c'),
  ('2026-05-04', 2, 20842.5, 'Daewoo Battery / Talha', '0745d84b-8166-4198-b5d0-5858e0cba724'),
  ('2026-05-04', 1, 25042.5, 'Daewoo Battery / Talha', '71de1515-8f42-4663-b300-0283ca19ab04'),
  ('2026-05-04', 1, 25042.5, 'Daewoo Battery / Talha', '6031b6bc-6c10-4960-8e75-221ec1408dc1'),
  ('2026-05-02', 30, 18500, 'Moen Sunfull/ Evergreen Tyre', '85b85f62-df37-4bfa-a86d-08e656027f5c'),
  ('2026-05-01', 4, 25000, 'Hassan Iqbal Lahore', '67f718ac-2767-494c-9680-f957b70df380'),
  ('2026-05-01', 4, 32000, 'Hassan Iqbal Lahore', 'cb6851a1-e1f9-4394-89d1-be067e4d7b88'),
  ('2026-05-02', 4, 19000, 'Hassan Iqbal Lahore', 'c8b3dc87-09fb-44b7-833d-fba743a74efa'),
  ('2026-05-02', 4, 13000, 'Hassan Iqbal Lahore', 'b584a71d-31fb-48ee-a25a-30e8e4949bea'),
  ('2026-05-02', 4, 10500, 'Hassan Iqbal Lahore', '23bc5166-c02c-4df8-b2fb-9351d8dcb6c2'),
  ('2026-04-23', 10, 18500, 'Awami Tyre / zeeshan jahngir', '37f3fa3d-b9e8-4513-abe1-24aa4629374b'),
  ('2026-04-23', 12, 7800, 'Awami Tyre / zeeshan jahngir', '689c0cd8-c79a-4056-a396-c334df10dade'),
  ('2026-04-23', 10, 8800, 'Awami Tyre / zeeshan jahngir', '1d0ca87a-d8a2-492b-8b79-6a63d314caa4'),
  ('2026-04-08', 2, 42000, 'Olampia Traders / Haseeb', '91497f6a-660a-4750-8956-78820b87dc02'),
  ('2026-05-03', 8, 7600, 'Olampia Traders / Haseeb', '785da518-61ae-4d65-8477-4c3a908e0395'),
  ('2026-05-03', 2, 42500, 'Olampia Traders / Haseeb', 'e3a230cf-5e10-46c3-9565-b263e4cf2c56'),
  ('2026-05-06', 4, 9200, 'Imran STD / Hifly', 'b46e43eb-9978-4fe8-85e6-ec0b3efad10f'),
  ('2026-05-16', 12, 15150, 'Abdula waris Tyre / Shazaman', '0a11c76a-049a-4ec4-b702-904e401ac2c7'),
  ('2026-05-16', 50, 18500, 'Moen Sunfull/ Evergreen Tyre', '7f2752c9-fa11-4f2a-b7a8-5274924ab856'),
  ('2026-05-16', 12, 22500, 'Moen Sunfull/ Evergreen Tyre', '24d4ca84-b6c6-42b5-8bc1-ee84538fc088'),
  ('2026-05-16', 12, 20400, 'Moen Sunfull/ Evergreen Tyre', 'bd173a3a-43de-473f-b176-7e1af5cee855'),
  ('2026-05-16', 30, 7700, 'Moen Sunfull/ Evergreen Tyre', '8e92115a-ff1f-4436-817f-5230f1ca557a'),
  ('2026-05-16', 12, 8000, 'Moen Sunfull/ Evergreen Tyre', '9e6f5195-f491-4c33-9101-2a4d3cd3fb63'),
  ('2026-05-16', 20, 10000, 'Moen Sunfull/ Evergreen Tyre', '05b27774-7a76-42e6-bc97-4f516579135f'),
  ('2026-05-16', 12, 8000, 'Moen Sunfull/ Evergreen Tyre', 'e86cfdbe-69c1-4522-9fc0-65146167d667'),
  ('2026-05-17', 15, 41800, 'Rauf Tyre karachi', '44d514e4-0a6a-48c4-a43b-b89f1076b3a1'),
  ('2026-05-11', 7, 18500, 'Awami Tyre / zeeshan jahngir', '74d82596-783e-48aa-9e3a-11ec586b886d'),
  ('2026-05-11', 5, 9000, 'Awami Tyre / zeeshan jahngir', '757bf96f-cf0c-4b6a-9ff7-9dc10fb601a1'),
  ('2026-05-11', 5, 5100, 'Awami Tyre / zeeshan jahngir', '135dc456-e22b-44ec-96c3-f6f96eab181f'),
  ('2026-05-11', 25, 760, 'Awami Tyre / zeeshan jahngir', '2a26db18-b255-4bd4-a4b3-c4aa2f4c5495'),
  ('2026-05-11', 25, 840, 'Awami Tyre / zeeshan jahngir', '6889827e-8d72-431f-966c-e0875e84c20d'),
  ('2026-05-11', 50, 660, 'Awami Tyre / zeeshan jahngir', 'fe692273-573e-4f89-ae31-69e051bf1050'),
  ('2026-05-19', 4, 16231.68, 'Abdullah Tyre DG Khan', 'c0929922-0538-4aa4-a879-d8823b3ca276'),
  ('2026-05-19', 4, 15840, 'Abdullah Tyre DG Khan', 'e67c59e3-193d-4e23-a99c-548213137472'),
  ('2026-05-19', 5, 19368, 'Abdullah Tyre DG Khan', '6b56920c-296e-4229-b9f6-c439ef417c9a'),
  ('2026-05-19', 4, 13200, 'Abdullah Tyre DG Khan', '2661ce83-394b-42b5-ad5d-af49fbef5139'),
  ('2026-05-19', 10, 7608, 'Abdullah Tyre DG Khan', 'e2086334-d385-40aa-b936-e6bfa4607f24'),
  ('2026-05-19', 8, 10166.4, 'Abdullah Tyre DG Khan', 'd9df08ef-29e8-4ffb-89a0-b9944ed630f1'),
  ('2026-05-19', 12, 13622.4, 'Abdullah Tyre DG Khan', '3f510bbe-f764-40fb-8f01-281850c4809e'),
  ('2026-05-20', 15, 41250, 'Ayaz Khan / Nasir and sons', '6b9f1f82-dac3-4b5d-b020-a1370d187869'),
  ('2026-05-20', 1, 56650, 'Apex Lithium/ Anas', '624225f7-34ca-4dfc-bc1f-a2a6e890ad51'),
  ('2026-05-20', 1, 123600, 'Apex Lithium/ Anas', 'fbcf543c-ede6-4c06-afc4-ae3de13a5f0f'),
  ('2026-05-26', 15, 41800, 'Rauf Tyre karachi', 'afb4fd17-1505-4aba-af13-a37c5679c59d'),
  ('2026-05-25', 10, 26599.5, 'Daewoo Battery / Talha', '4f48225c-c394-466e-93f4-c5ad5bda7b7c'),
  ('2026-05-25', 5, 13072.5, 'Daewoo Battery / Talha', '1513d551-e92a-4f25-85d2-95e70eb7b4e7'),
  ('2026-05-25', 3, 13597.5, 'Daewoo Battery / Talha', 'b3a5fc60-1db9-48a7-b772-f4d54a1a643d'),
  ('2026-05-25', 10, 24012, 'Daewoo Battery / Talha', 'a85884ad-c673-4e2a-a160-19f49a489339'),
  ('2026-05-20', 8, 21800, 'Ayaz Khan / Nasir and sons', '43101590-c56b-42aa-a28c-14204c066a5f'),
  ('2026-05-20', 4, 22000, 'Ayaz Khan / Nasir and sons', '8be17c11-dfba-4a35-8cbe-0061dd5c2e03'),
  ('2026-05-19', 10, 26879.4, 'Phoenix Battery  Dealership', '1499bc47-49d4-4d13-bd01-3e6791363962'),
  ('2026-05-19', 4, 27740.5, 'Phoenix Battery  Dealership', '64d78616-c8c8-4729-a8e0-14884d9ce4a6'),
  ('2026-05-13', 6, 9400, 'Imran STD / Hifly', '05f0f838-4f4a-45f2-9189-80a357e76f63'),
  ('2026-05-13', 6, 9400, 'Imran STD / Hifly', '972d6215-18e4-4347-9aed-821a0d92ec7c'),
  ('2026-06-10', 1, 56650, 'Apex Lithium/ Anas', '1295df6d-acf2-4f12-9423-10e7d1aeb0e0'),
  ('2026-06-06', 10, 5264.7, 'Phoenix Battery  Dealership', '50a26cb9-186b-4b5d-974c-9f8b2457b6b7'),
  ('2026-06-06', 10, 26879.4, 'Phoenix Battery  Dealership', '9f8a05e4-4757-4098-8780-8dfb02e67680'),
  ('2026-06-06', 5, 30814.3, 'Phoenix Battery  Dealership', 'c587ec2e-c504-49f3-8648-942290f6b7d6'),
  ('2026-06-06', 7, 7924.3, 'Phoenix Battery  Dealership', 'de869f95-6614-4171-be0d-f1ed07df1b1d'),
  ('2026-06-06', 4, 40984, 'Phoenix Battery  Dealership', 'd7bfb36e-7de1-438c-8d3d-1d22c81ff5fa'),
  ('2026-06-09', 50, 18500, 'Moen Sunfull/ Evergreen Tyre', 'f74bfcc4-849e-441f-ab28-9814b61f7a23'),
  ('2026-06-09', 4, 11000, 'Moen Sunfull/ Evergreen Tyre', 'e3d44148-19cd-4585-8726-b9ae3cbbc441'),
  ('2026-06-09', 4, 11500, 'Moen Sunfull/ Evergreen Tyre', '1cd5b64c-6e3e-46ef-a41a-8b20ed5872a9'),
  ('2026-06-16', 6, 10500, 'Lucky Tyre / Umar', 'bd1370df-b02b-46a3-91cf-a8bc11e8e814'),
  ('2026-06-16', 2, 850, 'Lucky Tyre / Umar', '5cde31c6-04ba-4739-853d-2cdc2194cb8c'),
  ('2026-06-16', 6, 7600, 'Olampia Traders / Haseeb', '43fc73c3-c0d3-449c-a0cf-563eb53833ef'),
  ('2026-06-21', 5, 42500, 'Olampia Traders / Haseeb', 'e078710c-560d-4410-901a-c832e7886da0'),
  ('2026-02-11', 4, 12800, 'Awami Tyre / zeeshan jahngir', '26dc3e78-6fa2-43f4-8687-a95a95a4ac52'),
  ('2026-02-21', 4, 9200, 'Awami Tyre / zeeshan jahngir', 'e3883c24-b5e5-4974-b0ce-15ff07d470d2'),
  ('2026-06-10', 10, 28000, 'Rauf Tyre karachi', '588d2b35-26ef-490e-a9e8-7383ca08ab26'),
  ('2026-06-20', 2, 35292, 'Daewoo Battery / Talha', '65a879f5-eef3-40d1-967e-61063bcb4c1c'),
  ('2026-06-20', 5, 32079, 'Daewoo Battery / Talha', '6c53d848-36a9-4f7d-af87-492545954ee7'),
  ('2026-06-20', 5, 12823.5, 'Daewoo Battery / Talha', 'ab047593-19c6-4204-a776-ee92283f3f6a'),
  ('2026-06-20', 1, 13338.5, 'Daewoo Battery / Talha', '9d33806c-5c4a-4983-a0b9-3683647412ab'),
  ('2026-06-20', 2, 18900.5, 'Daewoo Battery / Talha', '3e774a6e-62f9-4d2f-a167-d7ff150ca486'),
  ('2026-06-20', 2, 20188, 'Daewoo Battery / Talha', '119de38e-bd2c-48ea-a8a7-f549d7cf2266'),
  ('2026-06-20', 15, 13390, 'Daewoo Battery / Talha', 'c97f0ff4-42ff-498a-94e5-81319eba5d32'),
  ('2026-05-19', 2, 12500, 'Awami Tyre / zeeshan jahngir', '9a6d3424-6a4f-4f0e-ad2f-8a94ed59ae64'),
  ('2026-06-13', 2, 16400, 'Awami Tyre / zeeshan jahngir', 'cf44db0e-5ae6-45c8-82a0-f543b8a4751d'),
  ('2026-06-14', 4, 30000, 'Awami Tyre / zeeshan jahngir', '16abe9cf-995f-4a2f-9470-68b7c4542d33'),
  ('2026-06-17', 4, 18500, 'Awami Tyre / zeeshan jahngir', '1d62aa95-8441-4990-9278-44bfd69fec2a'),
  ('2026-06-20', 4, 11500, 'Awami Tyre / zeeshan jahngir', 'ef5fcc60-cc96-4cbb-9111-7039fcaebf79'),
  ('2026-06-20', 4, 900, 'Awami Tyre / zeeshan jahngir', 'd3e2d5df-4b12-4ed2-8c92-37fb142c33c7'),
  ('2026-06-21', 8, 18300, 'Awami Tyre / zeeshan jahngir', '020eea4c-1f13-4374-b2c1-830d565433a5'),
  ('2026-06-21', 5, 41800, 'Awami Tyre / zeeshan jahngir', '14754235-7d36-47c8-9adb-95ea05794461'),
  ('2026-06-21', 8, 7675.2, 'Rahet Battery / Mubashar', '582c91c9-b734-484c-9eb1-d964580cb866'),
  ('2026-06-21', 6, 6344, 'Rahet Battery / Mubashar', '539a863b-e776-42e9-9396-6ecb711ceff8'),
  ('2026-06-21', 15, 25220, 'Rahet Battery / Mubashar', '0519491a-4950-45d0-9bd7-2f7eb9d70fca'),
  ('2026-06-21', 10, 22360, 'Rahet Battery / Mubashar', 'a7a84a5a-c694-47d1-9f83-fa33c5cb93d5'),
  ('2026-06-21', 6, 24750.9, 'Rahet Battery / Mubashar', 'f32a95be-0c5d-4f3d-aff3-8501b044c6b0'),
  ('2026-06-21', 5, 27913, 'Rahet Battery / Mubashar', 'f0d5a467-30af-4bf3-b0db-d2001bfd18db'),
  ('2026-06-21', 2, 28077.8, 'Rahet Battery / Mubashar', '3746ad42-6684-4513-aca5-b363d57e8870'),
  ('2026-06-21', 4, 36000, 'Rahet Battery / Mubashar', 'd8815cbc-8042-4284-9285-b32c8d5a24ee'),
  ('2026-06-21', 4, 28500, 'Multan Tyre Center / MTC Waseem Sb', '4094738d-882e-446b-b2e8-d90628a8180c'),
  ('2026-06-29', 2, 20800, 'Olampia Traders / Haseeb', 'e335340a-e7ad-4cc4-a2f1-8c0f21a471e4'),
  ('2026-06-29', 15, 42500, 'Olampia Traders / Haseeb', '518f1cb1-be1a-425c-a8ed-5a7b952f87bf'),
  ('2026-06-29', 4, 31000, 'Olampia Traders / Haseeb', '978040ed-876c-4b06-bfdc-f25442c88a06'),
  ('2026-06-29', 2, 34711, 'Rahet Battery / Mubashar', '4f425472-22a7-49b4-8248-58c3c8e8861b'),
  ('2026-06-29', 2, 19930.5, 'Rahet Battery / Mubashar', 'bc21588b-192f-404d-a937-c689e263b7b6'),
  ('2026-06-29', 2, 9424.5, 'Rahet Battery / Mubashar', '2c7b72bf-604b-4af9-a1d6-c2b83ad4438d'),
  ('2026-06-29', 5, 13493, 'Rahet Battery / Mubashar', '95f0b92a-9789-4da8-a34b-e61a5fb145b3'),
  ('2026-06-29', 5, 10825.3, 'Rahet Battery / Mubashar', '0ad57b7d-4884-4312-87f8-389261b635ad'),
  ('2026-06-29', 2, 35280, 'Rahet Battery / Mubashar', '193b424c-46f8-422f-959e-fa20fbb7a49b');

-- ===== Merchant ledger (291 entries from 298 legacy invoices, 7 skipped — unknown merchant) =====
insert into public.merchant_ledger (merchant_id, entry_type, amount, method, reference, note, entry_date) values
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 1576900, null, 'INV1550c3', 'Imported: stock purchase (Stock)', '2026-01-17'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 2940300, null, 'INVb30450', 'Imported: stock purchase (Stock)', '2026-01-17'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 2198553, 'cash', 'INV43c161', 'Imported: payment ref Opening balance', '2026-01-17'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 1600100, null, 'INV516c9b', 'Imported: stock purchase (Stock)', '2026-01-17'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 1387700, 'cash', 'INV72212f', 'Imported: payment ref Opening balance', '2026-01-17'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 555150, null, 'INVc2409e', 'Imported: stock purchase (Stock)', '2026-01-18'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 635300, null, 'INV2de1f6', 'Imported: stock purchase (Stock)', '2026-01-18'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'purchase', 580400, null, 'INV6e375e', 'Imported: stock purchase (Stock)', '2026-01-18'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 851850, null, 'INV7dd467', 'Imported: stock purchase (Stock)', '2026-01-18'),
  ('6ad2c367-bbe0-48c0-bfe5-69cdefb39c1d', 'purchase', 108500, null, 'INV96a781', 'Imported: stock purchase (Stock)', '2026-01-18'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 851722.95, null, 'INV007289', 'Imported: stock purchase (Stock)', '2026-01-20'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 228755.85, null, 'INVd32de1', 'Imported: stock purchase (Stock)', '2026-01-20'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 1239123.1, null, 'INV34e584', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 486264.4, null, 'INV8d80dd', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 893019.7, null, 'INVaa8bcc', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 69222.4, null, 'INV420f9f', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('edb6c7de-bfce-41ef-835d-5cab72f00d38', 'purchase', 107676, null, 'INVb8249a', 'Imported: stock purchase (Stock)', '2026-01-02'),
  ('edb6c7de-bfce-41ef-835d-5cab72f00d38', 'payment', 107125, 'bank', 'INVe0ca2c', 'Imported: payment', '2026-01-20'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 70000, 'cash', 'INV805993', 'Imported: payment ref Cargo silk line 40366', '2026-01-10'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 1206048, 'cash', 'INV124e20', 'Imported: payment', '2026-01-20'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 77600, null, 'INVc9e397', 'Imported: stock purchase (Stock)', default),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 85600, null, 'INVe1bc25', 'Imported: stock purchase (Stock)', '2026-01-04'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 8425, null, 'INV18fc39', 'Imported: stock purchase (Stock)', '2026-01-22'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 1918790.3, null, 'INV8d2f8c', 'Imported: stock purchase (Stock)', '2026-01-04'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 743000, 'cash', 'INV69e700', 'Imported: payment', '2026-01-15'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 48541.98, null, 'INV9c162c', 'Imported: stock purchase (Stock)', '2026-01-22'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 427000, null, 'INV1e93d3', 'Imported: stock purchase (Stock)', '2026-01-22'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 643150, 'cash', 'INV366790', 'Imported: payment', '2026-01-01'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 468500, null, 'INVa7f5fe', 'Imported: stock purchase (Stock)', '2026-01-24'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 468500, null, 'INV5ff509', 'Imported: stock purchase (Stock)', '2026-01-24'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 346000, null, 'INV56b950', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 35309, null, 'INV9083c8', 'Imported: stock purchase (Stock)', '2026-01-22'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 35309, null, 'INV055fc2', 'Imported: stock purchase (Stock)', '2026-01-22'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 1900000, 'cash', 'INV5acc01', 'Imported: payment ref Fort’s enterprise', '2026-01-24'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 200000, 'cash', 'INV1f1b37', 'Imported: payment ref Hassan Iqbal', '2026-01-24'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 627618, 'cash', 'INV47fe5a', 'Imported: payment', '2026-01-20'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 300000, 'cash', 'INV878be0', 'Imported: payment', '2026-01-25'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 252000, null, 'INVddbc66', 'Imported: stock purchase (Stock)', '2026-01-25'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 63970, null, 'INVcbebee', 'Imported: stock purchase (Stock)', '2026-01-28'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 35309, 'cash', 'INVca9dd7', 'Imported: payment ref 22-1-26', '2026-01-28'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1200000, 'cash', 'INVeb85b5', 'Imported: payment ref To MCB', '2026-01-28'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 468500, 'cash', 'INV60217d', 'Imported: payment ref 24-1-26', '2026-01-24'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 200000, 'cash', 'INV3f4629', 'Imported: payment ref To Alfalah', '2026-01-28'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'payment', 200000, 'cash', 'INV647a50', 'Imported: payment ref To meezan bank', '2026-01-28'),
  ('838110c5-e7c5-43f9-88a1-79f706013489', 'purchase', 46730, null, 'INV6d0249', 'Imported: stock purchase (Stock)', '2026-01-27'),
  ('ea730afe-a3d6-4410-ae59-7c07f1164ddd', 'purchase', 127800, null, 'INV587033', 'Imported: stock purchase (Stock)', '2026-01-08'),
  ('6ad2c367-bbe0-48c0-bfe5-69cdefb39c1d', 'payment', 108500, 'cash', 'INV3986f1', 'Imported: payment', '2026-01-15'),
  ('ea730afe-a3d6-4410-ae59-7c07f1164ddd', 'payment', 127800, 'cash', 'INV502f0d', 'Imported: payment', '2026-01-09'),
  ('838110c5-e7c5-43f9-88a1-79f706013489', 'payment', 46730, 'cash', 'INVbe3078', 'Imported: payment', '2026-01-26'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 405400, 'cash', 'INV5ad029', 'Imported: payment', '2026-01-28'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'purchase', 85824, null, 'INV808ae3', 'Imported: stock purchase (Stock)', '2026-01-29'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 164000, null, 'INVcb8ceb', 'Imported: stock purchase (Stock)', '2026-01-31'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 228755.85, null, 'INVaea00d', 'Imported: stock purchase (Stock)', '2026-01-20'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'payment', 982085, 'cash', 'INV12b22f', 'Imported: payment ref Frk nikala hy', '2026-01-30'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 139160, null, 'INVa5ed8d', 'Imported: stock purchase (Stock)', '2026-01-19'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 354, 'cash', 'INVfd7306', 'Imported: payment ref -2 % lgana tha -1 bhol kr lga dea', '2026-01-31'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 36723.6, null, 'INV37eec8', 'Imported: stock purchase (Stock)', '2026-01-29'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 75000, null, 'INV300fda', 'Imported: stock purchase (Stock)', '2026-01-31'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 1064177.4, null, 'INV8470e4', 'Imported: stock purchase (Stock)', '2026-01-31'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 408900, 'cash', 'INV6d14ba', 'Imported: payment', '2026-01-31'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'purchase', 641500, null, 'INV186198', 'Imported: stock purchase (Stock)', '2026-02-02'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'purchase', 641500, null, 'INVc047f7', 'Imported: stock purchase (Stock)', '2026-02-02'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 1462797.83, null, 'INV77bc8a', 'Imported: stock purchase (Stock)', '2026-01-25'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 242866.97, null, 'INVf27212', 'Imported: stock purchase (Stock)', '2026-01-31'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 60000, 'cash', 'INV90e180', 'Imported: payment', '2026-02-03'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 100000, 'cash', 'INVaeccaa', 'Imported: payment', '2026-02-04'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 500000, 'cash', 'INV291d0f', 'Imported: payment', '2026-02-09'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 641500, 'cash', 'INV20d812', 'Imported: payment', '2026-02-09'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV18e592', 'Imported: payment', '2026-02-10'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 300000, 'cash', 'INV412224', 'Imported: payment ref To Seven Star old and New Tyres and Tubes', '2026-02-12'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 500000, 'cash', 'INVfc003a', 'Imported: payment', '2026-02-12'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 158200, null, 'INV3b55db', 'Imported: stock purchase (Stock)', '2026-02-15'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 108637.49, null, 'INVfc132e', 'Imported: stock purchase (Stock)', '2026-02-15'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 485146, 'cash', 'INV6bc46e', 'Imported: payment', '2026-02-16'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 1049114, null, 'INV69a814', 'Imported: stock purchase (Stock)', '2026-02-16'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 30198, null, 'INVa958af', 'Imported: stock purchase (Stock)', '2026-02-16'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 600000, null, 'INVc7dffd', 'Imported: stock purchase (Stock)', '2026-02-17'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1800000, 'cash', 'INV555fbc', 'Imported: payment ref As traders', '2026-02-17'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 150000, 'cash', 'INV29115f', 'Imported: payment ref Seven star tyre', '2026-02-21'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 200000, 'cash', 'INV61a9d2', 'Imported: payment', '2026-02-22'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'payment', 200000, 'cash', 'INVa9dcaf', 'Imported: payment ref Trible battery', '2026-02-23'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 150000, 'cash', 'INV802b3f', 'Imported: payment', '2026-02-23'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV1b1827', 'Imported: payment', '2026-02-24'),
  ('ea730afe-a3d6-4410-ae59-7c07f1164ddd', 'purchase', 26000, null, 'INV3854df', 'Imported: stock purchase (Stock)', '2026-02-25'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 249120, null, 'INV528fcd', 'Imported: stock purchase (Stock)', '2026-02-25'),
  ('ea730afe-a3d6-4410-ae59-7c07f1164ddd', 'payment', 26000, 'cash', 'INV26d231', 'Imported: payment', '2026-02-25'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 712100, null, 'INVff7075', 'Imported: stock purchase (Stock)', '2026-02-23'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 120000, null, 'INVebf71f', 'Imported: stock purchase (Stock)', '2026-02-24'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 1830216.84, null, 'INVd07af1', 'Imported: stock purchase (Stock)', '2026-02-25'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 65940, null, 'INV85e30a', 'Imported: stock purchase (Stock)', '2026-02-25'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'purchase', 226500, null, 'INV3d2f4f', 'Imported: stock purchase (Stock)', '2026-02-25'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 650000, 'cash', 'INV3d6586', 'Imported: payment ref As traders', '2026-02-28'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'payment', 180000, 'cash', 'INV3cdf92', 'Imported: payment ref Hk Tyres', '2026-02-28'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 500000, 'cash', 'INV53e609', 'Imported: payment', '2026-02-28'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 65940, null, 'INVba95f5', 'Imported: stock purchase (Stock)', '2026-02-18'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 204000, null, 'INV096f11', 'Imported: stock purchase (Stock)', '2026-02-26'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 200000, 'cash', 'INV5514f6', 'Imported: payment', '2026-02-28'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INVf59982', 'Imported: payment', '2026-03-03'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 663520, 'cash', 'INVa953b2', 'Imported: payment ref Saleem sab khan godam', '2026-03-03'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'purchase', 836609.8, null, 'INV26e7a5', 'Imported: stock purchase (Stock)', '2026-03-03'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 341250, null, 'INV1d7531', 'Imported: stock purchase (Stock)', '2026-03-03'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 341250, null, 'INV2b5630', 'Imported: stock purchase (Stock)', '2026-03-03'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INVe5bdf5', 'Imported: payment ref Wheel and wheel service', '2026-03-05'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 15600, 'cash', 'INVae07ba', 'Imported: payment ref Bhol krr 15000 rate likh dea asal rate 13440', '2026-03-05'),
  ('75a869d0-63fa-4f7d-95d8-047e1e5348d3', 'payment', 1100000, 'cash', 'INV97c06d', 'Imported: payment ref Ather shezad', '2026-03-05'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 1181400, null, 'INV27e2c2', 'Imported: stock purchase (Stock)', '2026-03-07'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 500000, 'cash', 'INV71bcc4', 'Imported: payment ref Forts enterprises', '2026-03-07'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 449089.6, null, 'INV10734d', 'Imported: stock purchase (Stock)', '2026-03-09'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 449089.6, null, 'INV441ad1', 'Imported: stock purchase (Stock)', '2026-03-09'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 449089, 'cash', 'INV2c8889', 'Imported: payment ref Mistake', '2026-03-09'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1000000, 'cash', 'INV6233b1', 'Imported: payment ref Abdul rehman', '2026-03-09'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV6f3232', 'Imported: payment ref Arif', '2026-03-10'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'purchase', 175796.22, null, 'INV46706f', 'Imported: stock purchase (Stock)', '2026-03-10'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'payment', 200000, 'cash', 'INV4d7860', 'Imported: payment', '2026-03-10'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 82000, null, 'INVc9a174', 'Imported: stock purchase (Stock)', '2026-03-16'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 341250, 'cash', 'INVd8fed5', 'Imported: payment', '2026-03-16'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 117040, null, 'INV5ea98d', 'Imported: stock purchase (Stock)', '2026-03-16'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 144000, null, 'INV802f48', 'Imported: stock purchase (Stock)', '2026-03-02'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 274400, null, 'INV634e40', 'Imported: stock purchase (Stock)', '2026-03-06'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 250000, 'cash', 'INVe8bf22', 'Imported: payment', '2026-03-17'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'purchase', 6420, null, 'INVc7598b', 'Imported: stock purchase (Stock)', '2026-03-17'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INVfa3bba', 'Imported: payment', '2026-03-17'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 300000, 'cash', 'INV021492', 'Imported: payment', '2026-03-17'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1000000, 'cash', 'INVe88aa1', 'Imported: payment', '2026-03-17'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INV0f7861', 'Imported: payment', '2026-03-17'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 627100, null, 'INVc36d46', 'Imported: stock purchase (Stock)', '2026-03-16'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 100000, 'cash', 'INVe5fb8c', 'Imported: payment', '2026-03-04'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 150000, 'cash', 'INVe4c333', 'Imported: payment', '2026-03-28'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'payment', 100000, 'cash', 'INV64dc02', 'Imported: payment', '2026-03-28'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 100000, 'cash', 'INV01aa4e', 'Imported: payment', '2026-03-28'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 100000, 'cash', 'INVf19057', 'Imported: payment', '2026-03-28'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 40000, 'cash', 'INV01c794', 'Imported: payment', '2026-03-28'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 300000, 'cash', 'INV4497ee', 'Imported: payment', '2026-03-29'),
  ('73a72839-e378-472c-9776-981780828ced', 'purchase', 144000, null, 'INV820e08', 'Imported: stock purchase (Stock)', '2026-03-04'),
  ('73a72839-e378-472c-9776-981780828ced', 'purchase', 71500, null, 'INV03576e', 'Imported: stock purchase (Stock)', '2026-03-01'),
  ('73a72839-e378-472c-9776-981780828ced', 'payment', 150000, 'cash', 'INVea558c', 'Imported: payment', '2026-03-28'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 1698480, null, 'INV094770', 'Imported: stock purchase (Stock)', '2026-03-29'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 642550, 'cash', 'INV1d1948', 'Imported: payment ref 25865', '2026-03-29'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 173000, null, 'INV00e7ff', 'Imported: stock purchase (Stock)', '2026-03-29'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 1000000, 'bank', 'INV222f50', 'Imported: payment ref national bank Cheque zeeshan Mother', '2026-03-29'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV196a77', 'Imported: payment', '2026-03-31'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 841796, null, 'INVbbdb88', 'Imported: stock purchase (Stock)', '2026-03-28'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 129765, null, 'INV1bf0f4', 'Imported: stock purchase (Stock)', '2026-03-28'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 227352.5, null, 'INV29fd96', 'Imported: stock purchase (Stock)', '2026-04-01'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 1501575, 'cash', 'INV4e10bb', 'Imported: payment ref treet battery Limited', '2026-03-13'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 1000000, 'cash', 'INV548078', 'Imported: payment ref treet battery Limited', '2026-03-30'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 148200, null, 'INV0db68c', 'Imported: stock purchase (Stock)', '2026-03-05'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 536500, null, 'INV6f1c6c', 'Imported: stock purchase (Stock)', '2026-03-29'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 195000, null, 'INV660c29', 'Imported: stock purchase (Stock)', '2026-04-02'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 493762.5, null, 'INVb9520c', 'Imported: stock purchase (Stock)', '2026-04-30'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INVaa5541', 'Imported: payment', '2026-04-02'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 1000000, 'cash', 'INV04c1a1', 'Imported: payment', '2026-04-04'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 1125000, null, 'INV78e6dc', 'Imported: stock purchase (Stock)', '2026-04-04'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 73227, null, 'INVb685a0', 'Imported: stock purchase (Stock)', '2026-04-06'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 500000, 'cash', 'INV35d7f2', 'Imported: payment', '2026-04-06'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 150000, 'cash', 'INV211fd4', 'Imported: payment', '2026-04-06'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 372200, null, 'INV78452d', 'Imported: stock purchase (Stock)', '2026-04-04'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 1161978, null, 'INV2d70d0', 'Imported: stock purchase (Stock)', '2026-04-07'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 5208, 'cash', 'INVda6fc7', 'Imported: payment', '2026-04-07'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 608000, 'cash', 'INV19e43b', 'Imported: payment', '2026-04-08'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 68922.4, null, 'INV56100a', 'Imported: stock purchase (Stock)', '2026-04-09'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'purchase', 160000, null, 'INVef7b4e', 'Imported: stock purchase (Stock)', '2026-04-09'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'payment', 100000, 'cash', 'INVea36ce', 'Imported: payment', '2026-04-13'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 150000, 'cash', 'INVeb747c', 'Imported: payment', '2026-04-13'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 1590746, null, 'INV5fda21', 'Imported: stock purchase (Stock)', '2026-04-07'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 1730000, 'bank', 'INVd6081d', 'Imported: payment', '2026-04-07'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 618531.4, null, 'INVe8c5af', 'Imported: stock purchase (Stock)', '2026-04-16'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 700000, 'cash', 'INV70c3d2', 'Imported: payment', '2026-04-15'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1000000, 'cash', 'INV38197d', 'Imported: payment', '2026-04-17'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'purchase', 139200, null, 'INVc891cc', 'Imported: stock purchase (Stock)', '2026-04-12'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 1364, null, 'INVee7b23', 'Imported: stock purchase (Stock)', '2026-04-18'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 115096.5, null, 'INV6fddf3', 'Imported: stock purchase (Stock)', '2026-04-17'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INVe12ed6', 'Imported: payment', '2026-04-19'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 104890, 'cash', 'INV98b6b5', 'Imported: payment', '2026-04-19'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 1161000, 'cash', 'INV17bda6', 'Imported: payment', '2026-04-16'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 885882.4, null, 'INV4db7fc', 'Imported: stock purchase (Stock)', '2026-04-18'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 79296, null, 'INV5b0948', 'Imported: stock purchase (Stock)', '2026-04-20'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 641325.2, null, 'INVba9bb4', 'Imported: stock purchase (Stock)', '2026-04-13'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'purchase', 9240, null, 'INV944827', 'Imported: stock purchase (Stock)', '2026-04-13'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV10b44c', 'Imported: payment', '2026-04-14'),
  ('4b116a54-24a9-4fbd-bf34-c1799c0be489', 'payment', 5000, 'cash', 'INV004208', 'Imported: payment', '2026-04-21'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 950000, 'bank', 'INV10b4d0', 'Imported: payment', '2026-04-21'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 627000, null, 'INV7c9f5a', 'Imported: stock purchase (Stock)', '2026-04-21'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 1200000, 'cash', 'INV7c17b2', 'Imported: payment', '2026-04-21'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 872130.8, null, 'INV32668e', 'Imported: stock purchase (Stock)', '2026-04-22'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 428978.75, null, 'INV445663', 'Imported: stock purchase (Stock)', '2026-04-19'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 458350, null, 'INVf3472e', 'Imported: stock purchase (Stock)', '2026-04-19'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 1040400, 'cash', 'INVb625d8', 'Imported: payment', '2026-04-22'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 885898.75, null, 'INVef9335', 'Imported: stock purchase (Stock)', '2026-04-23'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 1000000, 'bank', 'INV4a4480', 'Imported: payment', '2026-04-25'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 889331, null, 'INV56003e', 'Imported: stock purchase (Stock)', '2026-04-26'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 458350, null, 'INVc45c72', 'Imported: stock purchase (Stock)', '2026-04-18'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 458350, 'cash', 'INVbf5060', 'Imported: payment', '2026-04-27'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 437923.2, null, 'INVd7a503', 'Imported: stock purchase (Stock)', '2026-04-23'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 1009500, null, 'INV91942e', 'Imported: stock purchase (Stock)', '2026-04-23'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 777600, 'cash', 'INV96897e', 'Imported: payment', '2026-04-23'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 575000, null, 'INV2af71f', 'Imported: stock purchase (Stock)', '2026-04-04'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 553600, null, 'INV46b677', 'Imported: stock purchase (Stock)', '2026-04-27'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 695000, 'cash', 'INVcd76ca', 'Imported: payment', '2026-04-30'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 1500000, 'cash', 'INV2e02b2', 'Imported: payment', '2026-05-01'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 400000, 'cash', 'INV91ff3a', 'Imported: payment', '2026-05-01'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 100000, 'cash', 'INV7e8fc0', 'Imported: payment', '2026-05-01'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 150000, 'cash', 'INVe1cc7f', 'Imported: payment', '2026-05-01'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INV2e92ee', 'Imported: payment', '2026-05-01'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 200000, 'cash', 'INV5e45ae', 'Imported: payment', '2026-05-01'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 10000, 'cash', 'INV89a558', 'Imported: payment', '2026-05-01'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 150000, 'cash', 'INVe240f7', 'Imported: payment', '2026-05-01'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 250000, 'cash', 'INV0e3ce6', 'Imported: payment', '2026-05-02'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 441000, null, 'INVad22c6', 'Imported: stock purchase (Stock)', '2026-05-04'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 555000, null, 'INV0e5199', 'Imported: stock purchase (Stock)', '2026-05-02'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 228000, null, 'INV750f85', 'Imported: stock purchase (Stock)', '2026-05-01'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'purchase', 170000, null, 'INVa62b82', 'Imported: stock purchase (Stock)', '2026-05-02'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 500000, 'cash', 'INVf3858d', 'Imported: payment', '2026-04-23'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 366600, null, 'INVd100bf', 'Imported: stock purchase (Stock)', '2026-04-23'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 84000, null, 'INV3c2910', 'Imported: stock purchase (Stock)', '2026-04-08'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 145800, null, 'INVb02269', 'Imported: stock purchase (Stock)', '2026-05-03'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 36800, null, 'INV877ddd', 'Imported: stock purchase (Stock)', '2026-05-06'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 400000, 'cash', 'INVf0253b', 'Imported: payment', '2026-05-11'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 200000, 'cash', 'INVa1a488', 'Imported: payment', '2026-05-11'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'purchase', 181800, null, 'INV8f40b5', 'Imported: stock purchase (Stock)', '2026-05-16'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 30000, 'cash', 'INV87065e', 'Imported: payment', '2026-04-08'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 50000, 'cash', 'INV3d915b', 'Imported: payment', '2026-05-16'),
  ('f62e0955-0d84-4052-a572-04d10a9a1ad6', 'payment', 300000, 'cash', 'INV364f08', 'Imported: payment', '2026-05-16'),
  ('363db055-889c-45d9-ac91-f18548b64f56', 'payment', 350000, 'cash', 'INV4bf6ef', 'Imported: payment', '2026-05-16'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 2062800, null, 'INVacb5b5', 'Imported: stock purchase (Stock)', '2026-05-16'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 1000000, 'cash', 'INVa4a819', 'Imported: payment', '2026-05-18'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'purchase', 627000, null, 'INVae1e48', 'Imported: stock purchase (Stock)', '2026-05-17'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 273000, null, 'INVc729e0', 'Imported: stock purchase (Stock)', '2026-05-11'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'purchase', 598806.72, null, 'INV87c84c', 'Imported: stock purchase (Stock)', '2026-05-19'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 420000, 'cash', 'INV564403', 'Imported: payment', '2026-05-19'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 150000, 'cash', 'INV4a2873', 'Imported: payment', '2026-05-19'),
  ('c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4', 'purchase', 618750, null, 'INV24c8aa', 'Imported: stock purchase (Stock)', '2026-05-20'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 489000, 'cash', 'INV8d4a9b', 'Imported: payment', '2026-05-20'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 5000, 'cash', 'INV164101', 'Imported: payment', '2026-05-20'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 400000, 'cash', 'INV95ad5c', 'Imported: payment', '2026-05-21'),
  ('e4c326dd-eab1-4561-9475-e3e7c1520323', 'purchase', 180250, null, 'INV7a6183', 'Imported: stock purchase (Stock)', '2026-05-20'),
  ('e4c326dd-eab1-4561-9475-e3e7c1520323', 'payment', 180000, 'cash', 'INVcb2557', 'Imported: payment', '2026-05-21'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'purchase', 627000, null, 'INV78b97f', 'Imported: stock purchase (Stock)', '2026-05-26'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 612270, null, 'INV6ec1b6', 'Imported: stock purchase (Stock)', '2026-05-25'),
  ('c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4', 'payment', 618500, 'cash', 'INV2b2346', 'Imported: payment', '2026-05-20'),
  ('c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4', 'purchase', 262400, null, 'INVf8458c', 'Imported: stock purchase (Stock)', '2026-05-20'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 379756, null, 'INV000295', 'Imported: stock purchase (Stock)', '2026-05-19'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 1200000, 'cash', 'INV09888c', 'Imported: payment', '2026-06-02'),
  ('e9d7ab98-06c1-4682-8ed5-62306d081339', 'payment', 100000, 'cash', 'INVb64a7f', 'Imported: payment', '2026-06-02'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 350000, 'cash', 'INV573eb1', 'Imported: payment', '2026-06-02'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 100000, 'cash', 'INV3fd1dc', 'Imported: payment', '2026-06-02'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 400000, 'cash', 'INVcd7f1b', 'Imported: payment', '2026-06-02'),
  ('c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4', 'payment', 260000, 'cash', 'INV1c40c7', 'Imported: payment', '2026-06-02'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'payment', 760000, 'cash', 'INVca950a', 'Imported: payment', '2026-06-04'),
  ('36028413-1de7-4a23-9030-cb9baf362ad3', 'payment', 556000, 'cash', 'INVec7d60', 'Imported: payment', '2026-06-07'),
  ('4e1bc169-3730-4c84-83e3-baeb7f6155a5', 'payment', 19349, 'cash', 'INVc87e41', 'Imported: payment', '2026-06-08'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 56400, null, 'INV56f27c', 'Imported: stock purchase (Stock)', '2026-05-13'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'purchase', 56400, null, 'INV255968', 'Imported: stock purchase (Stock)', '2026-05-13'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'payment', 25000, 'cash', 'INV08462d', 'Imported: payment', '2026-06-13'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 1000000, 'cash', 'INVf615a1', 'Imported: payment', '2026-06-06'),
  ('e4c326dd-eab1-4561-9475-e3e7c1520323', 'purchase', 56650, null, 'INV2c4f4b', 'Imported: stock purchase (Stock)', '2026-06-10'),
  ('aed43735-b9b8-4dc0-898e-64c717935bc2', 'purchase', 694918.6, null, 'INV6cf4a5', 'Imported: stock purchase (Stock)', '2026-06-06'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'purchase', 1015000, null, 'INV0116dc', 'Imported: stock purchase (Stock)', '2026-06-09'),
  ('6670dbfb-88d1-410e-91ec-9db00742831d', 'payment', 900000, 'cash', 'INVe18258', 'Imported: payment', '2026-06-14'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 56400, 'cash', 'INV7e5c39', 'Imported: payment', '2026-06-14'),
  ('9a52c5cb-449e-4c55-bacd-86b4599bbb6a', 'payment', 150000, 'cash', 'INV38b188', 'Imported: payment', '2026-06-14'),
  ('73a72839-e378-472c-9776-981780828ced', 'payment', 65000, 'cash', 'INV2a4be5', 'Imported: payment', '2026-06-14'),
  ('e4c326dd-eab1-4561-9475-e3e7c1520323', 'payment', 56600, 'cash', 'INVd3ddcd', 'Imported: payment', '2026-06-14'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 200000, 'cash', 'INV32d61c', 'Imported: payment', '2026-06-15'),
  ('8cf4bb45-3f76-4034-8f44-3c337e1bb419', 'purchase', 64700, null, 'INV07445c', 'Imported: stock purchase (Stock)', '2026-06-16'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 45600, null, 'INV19b6c1', 'Imported: stock purchase (Stock)', '2026-06-16'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 42000, 'cash', 'INV79c863', 'Imported: payment', '2026-06-18'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 212500, null, 'INVcb2101', 'Imported: stock purchase (Stock)', '2026-06-21'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 51200, null, 'INV544a6e', 'Imported: stock purchase (Stock)', '2026-02-11'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 36800, null, 'INV49f87b', 'Imported: stock purchase (Stock)', '2026-02-21'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'purchase', 280000, null, 'INV07afba', 'Imported: stock purchase (Stock)', '2026-06-10'),
  ('d992edfd-39b9-4c5d-a65e-ffb45fdfcd49', 'payment', 283000, 'cash', 'INV76099a', 'Imported: payment', '2026-06-22'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'purchase', 587462, null, 'INV0fb2f1', 'Imported: stock purchase (Stock)', '2026-06-20'),
  ('15d92d94-04e1-498f-9d4a-ee222eb9adcc', 'payment', 143094, 'cash', 'INV945944', 'Imported: payment ref Cash Discount', '2026-06-04'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 25000, null, 'INV39d95b', 'Imported: stock purchase (Stock)', '2026-05-19'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 32800, null, 'INVe370b5', 'Imported: stock purchase (Stock)', '2026-06-13'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 120000, null, 'INV49d7cf', 'Imported: stock purchase (Stock)', '2026-06-14'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 74000, null, 'INV30d3f5', 'Imported: stock purchase (Stock)', '2026-06-17'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 49600, null, 'INV205a0b', 'Imported: stock purchase (Stock)', '2026-06-20'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'purchase', 355400, null, 'INV14c5c4', 'Imported: stock purchase (Stock)', '2026-06-21'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 5645, 'cash', 'INV5b08d2', 'Imported: payment', '2026-01-25'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 1189591.6, null, 'INV7ccd4a', 'Imported: stock purchase (Stock)', '2026-06-21'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 1431000, 'cash', 'INV36ca77', 'Imported: payment ref 30135', '2026-06-21'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 802, 'cash', 'INV383598', 'Imported: payment', '2026-06-24'),
  ('73a72839-e378-472c-9776-981780828ced', 'purchase', 114000, null, 'INVcc64ad', 'Imported: stock purchase (Stock)', '2026-06-21'),
  ('73a72839-e378-472c-9776-981780828ced', 'payment', 114000, 'cash', 'INVb92072', 'Imported: payment', '2026-06-21'),
  ('68513c99-c432-4322-b4e8-18033b3729e4', 'payment', 600000, 'cash', 'INV98bc97', 'Imported: payment', '2026-06-29'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'payment', 600000, 'cash', 'INVf184b0', 'Imported: payment', '2026-06-30'),
  ('eda139d9-acf0-4898-8af8-cec186f61277', 'purchase', 803100, null, 'INVd0bb28', 'Imported: stock purchase (Stock)', '2026-06-29'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'payment', 343400, 'cash', 'INVf19574', 'Imported: payment', '2026-06-29'),
  ('1a95ea4e-139c-4bcf-8179-158af3da1dcb', 'purchase', 320283.5, null, 'INV9805d5', 'Imported: stock purchase (Stock)', '2026-06-29');

-- ===== Customer sales invoices (finalized) =====
insert into public.invoices (id, invoice_id, customer_name, total_amount, payment_method, payment_status, client_id, created_at) values
  ('f01ef29e-b19a-47df-af67-24842f92204f', 'INVdb1643', 'Walk-in customer (MTBd3fcb3dfc1)', 23000, 'cash', 'paid', null, '2026-01-18 14:52:37+00');
insert into public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price, cost_price) values
  ('f01ef29e-b19a-47df-af67-24842f92204f', 'd06c8f5d-23af-4491-be2c-b3382cafb659', 'Evergreen 145R12', 2, 11500, 23000, 11500);
insert into public.customer_purchases (customer_name, product_id, quantity_purchased, total_price, cost_price, payment_method, payment_status, purchase_date) values
  ('Walk-in customer', 'd06c8f5d-23af-4491-be2c-b3382cafb659', 2, 23000, 11500, 'cash', 'paid', '2026-01-18');
insert into public.invoice_payments (invoice_id, amount, method, payment_date, note) values
  ('f01ef29e-b19a-47df-af67-24842f92204f', 23000, 'cash', '2026-01-18', 'Imported: settled in old system');
insert into public.invoices (id, invoice_id, customer_name, total_amount, payment_method, payment_status, client_id, created_at) values
  ('813fd234-a592-4226-bbd9-9afb53cddb7c', 'INV999d93', 'Walk-in customer (MTBa85a13edc6)', 25000, 'Cash', 'paid', null, '2026-01-25 15:03:34+00');
insert into public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price, cost_price) values
  ('813fd234-a592-4226-bbd9-9afb53cddb7c', '5802e98a-e32f-4828-aa21-d0d444bdd2ca', 'Ovation 195/65R15', 2, 12500, 25000, 12500);
insert into public.customer_purchases (customer_name, product_id, quantity_purchased, total_price, cost_price, payment_method, payment_status, purchase_date) values
  ('Walk-in customer', '5802e98a-e32f-4828-aa21-d0d444bdd2ca', 2, 25000, 12500, 'Cash', 'paid', '2026-01-25');
insert into public.invoice_payments (invoice_id, amount, method, payment_date, note) values
  ('813fd234-a592-4226-bbd9-9afb53cddb7c', 25000, 'cash', '2026-01-25', 'Imported: settled in old system');
insert into public.invoices (id, invoice_id, customer_name, total_amount, payment_method, payment_status, client_id, created_at) values
  ('16238ba9-5405-45de-997a-cf81669ae8f7', 'INVd62315', 'Walk-in customer (MTBdcbb930fb7)', 45795, 'Cash', 'paid', null, '2026-01-26 04:43:24+00');
insert into public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price, cost_price) values
  ('16238ba9-5405-45de-997a-cf81669ae8f7', '9302b467-c9cc-4b15-ba23-5f0bcc9da30b', 'HT200 osaka 21p', 1, 22795, 22795, 22795),
  ('16238ba9-5405-45de-997a-cf81669ae8f7', 'f30133de-bdeb-4617-a331-77943d8483f9', 'HT160 osaka 19p', 1, 23000, 23000, 23000);
insert into public.customer_purchases (customer_name, product_id, quantity_purchased, total_price, cost_price, payment_method, payment_status, purchase_date) values
  ('Walk-in customer', '9302b467-c9cc-4b15-ba23-5f0bcc9da30b', 1, 22795, 22795, 'Cash', 'paid', '2026-01-26'),
  ('Walk-in customer', 'f30133de-bdeb-4617-a331-77943d8483f9', 1, 23000, 23000, 'Cash', 'paid', '2026-01-26');
insert into public.invoice_payments (invoice_id, amount, method, payment_date, note) values
  ('16238ba9-5405-45de-997a-cf81669ae8f7', 45795, 'cash', '2026-01-26', 'Imported: settled in old system');
insert into public.invoices (id, invoice_id, customer_name, total_amount, payment_method, payment_status, client_id, created_at) values
  ('379de55d-95b9-4ea1-af62-914bc0bdf1b0', 'INVefab3c', 'Jaffar Bagga sher', 183000, 'cash', 'unpaid', '49b32f88-7a57-44e9-a7c1-a4f1ecd16336', '2026-02-22 10:50:12+00');
insert into public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price, cost_price) values
  ('379de55d-95b9-4ea1-af62-914bc0bdf1b0', '3952bec9-9db2-4646-899e-67dda5aabb7b', '185R14', 1, 19000, 19000, 19000),
  ('379de55d-95b9-4ea1-af62-914bc0bdf1b0', 'e0a74211-bf17-44df-9119-e0de840f7c53', 'Michelin 215/75R14', 2, 82000, 164000, 82000);
insert into public.customer_purchases (customer_name, product_id, quantity_purchased, total_price, cost_price, payment_method, payment_status, purchase_date) values
  ('Jaffar Bagga sher', '3952bec9-9db2-4646-899e-67dda5aabb7b', 1, 19000, 19000, 'cash', 'unpaid', '2026-02-22'),
  ('Jaffar Bagga sher', 'e0a74211-bf17-44df-9119-e0de840f7c53', 2, 164000, 82000, 'cash', 'unpaid', '2026-02-22');
insert into public.client_ledger (client_id, entry_type, amount, reference, note, entry_date) values
  ('49b32f88-7a57-44e9-a7c1-a4f1ecd16336', 'sale', 183000, 'INVefab3c', 'Imported: credit sale', '2026-02-22');
insert into public.invoices (id, invoice_id, customer_name, total_amount, payment_method, payment_status, client_id, created_at) values
  ('f2f1ffbf-ba70-4240-8c42-42b3a06a3964', 'INVbf5628', 'g', 800, 'cash', 'unpaid', '52fff8e5-b09d-4112-bd13-570265b8d57f', '2026-03-30 05:24:19+00');
insert into public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price, cost_price) values
  ('f2f1ffbf-ba70-4240-8c42-42b3a06a3964', '16503174-2cfb-4f64-a860-6fd47b50d48b', '500-12 Tube Diamond', 1, 800, 800, 800);
insert into public.customer_purchases (customer_name, product_id, quantity_purchased, total_price, cost_price, payment_method, payment_status, purchase_date) values
  ('g', '16503174-2cfb-4f64-a860-6fd47b50d48b', 1, 800, 800, 'cash', 'unpaid', '2026-03-30');
insert into public.client_ledger (client_id, entry_type, amount, reference, note, entry_date) values
  ('52fff8e5-b09d-4112-bd13-570265b8d57f', 'sale', 800, 'INVbf5628', 'Imported: credit sale', '2026-03-30');

-- ===== Opening-balance adjustments (make balances match the old system exactly) =====
update public.merchants set opening_balance = 89738.85 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '36028413-1de7-4a23-9030-cb9baf362ad3'), 0) where id = '36028413-1de7-4a23-9030-cb9baf362ad3';
update public.merchants set opening_balance = 1445747 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '6670dbfb-88d1-410e-91ec-9db00742831d'), 0) where id = '6670dbfb-88d1-410e-91ec-9db00742831d';
update public.merchants set opening_balance = 404134.25 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '75a869d0-63fa-4f7d-95d8-047e1e5348d3'), 0) where id = '75a869d0-63fa-4f7d-95d8-047e1e5348d3';
update public.merchants set opening_balance = 232000 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '363db055-889c-45d9-ac91-f18548b64f56'), 0) where id = '363db055-889c-45d9-ac91-f18548b64f56';
update public.merchants set opening_balance = 645220 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'f62e0955-0d84-4052-a572-04d10a9a1ad6'), 0) where id = 'f62e0955-0d84-4052-a572-04d10a9a1ad6';
update public.merchants set opening_balance = 149100 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '9a52c5cb-449e-4c55-bacd-86b4599bbb6a'), 0) where id = '9a52c5cb-449e-4c55-bacd-86b4599bbb6a';
update public.merchants set opening_balance = 60400 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'e9d7ab98-06c1-4682-8ed5-62306d081339'), 0) where id = 'e9d7ab98-06c1-4682-8ed5-62306d081339';
update public.merchants set opening_balance = 551755 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '68513c99-c432-4322-b4e8-18033b3729e4'), 0) where id = '68513c99-c432-4322-b4e8-18033b3729e4';
update public.merchants set opening_balance = 0 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '6ad2c367-bbe0-48c0-bfe5-69cdefb39c1d'), 0) where id = '6ad2c367-bbe0-48c0-bfe5-69cdefb39c1d';
update public.merchants set opening_balance = 0 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'ea730afe-a3d6-4410-ae59-7c07f1164ddd'), 0) where id = 'ea730afe-a3d6-4410-ae59-7c07f1164ddd';
update public.merchants set opening_balance = 431194.02 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '4e1bc169-3730-4c84-83e3-baeb7f6155a5'), 0) where id = '4e1bc169-3730-4c84-83e3-baeb7f6155a5';
update public.merchants set opening_balance = 551 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'edb6c7de-bfce-41ef-835d-5cab72f00d38'), 0) where id = 'edb6c7de-bfce-41ef-835d-5cab72f00d38';
update public.merchants set opening_balance = 548741.98 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'eda139d9-acf0-4898-8af8-cec186f61277'), 0) where id = 'eda139d9-acf0-4898-8af8-cec186f61277';
update public.merchants set opening_balance = 0 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '838110c5-e7c5-43f9-88a1-79f706013489'), 0) where id = '838110c5-e7c5-43f9-88a1-79f706013489';
update public.merchants set opening_balance = 1484 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '4b116a54-24a9-4fbd-bf34-c1799c0be489'), 0) where id = '4b116a54-24a9-4fbd-bf34-c1799c0be489';
update public.merchants set opening_balance = 0 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '1f61b368-e144-4ccf-8e80-bd2628162667'), 0) where id = '1f61b368-e144-4ccf-8e80-bd2628162667';
update public.merchants set opening_balance = 252500 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'd992edfd-39b9-4c5d-a65e-ffb45fdfcd49'), 0) where id = 'd992edfd-39b9-4c5d-a65e-ffb45fdfcd49';
update public.merchants set opening_balance = 105400 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '8cf4bb45-3f76-4034-8f44-3c337e1bb419'), 0) where id = '8cf4bb45-3f76-4034-8f44-3c337e1bb419';
update public.merchants set opening_balance = 500 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '73a72839-e378-472c-9776-981780828ced'), 0) where id = '73a72839-e378-472c-9776-981780828ced';
update public.merchants set opening_balance = -87861.2 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '1a95ea4e-139c-4bcf-8179-158af3da1dcb'), 0) where id = '1a95ea4e-139c-4bcf-8179-158af3da1dcb';
update public.merchants set opening_balance = -788266 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = '15d92d94-04e1-498f-9d4a-ee222eb9adcc'), 0) where id = '15d92d94-04e1-498f-9d4a-ee222eb9adcc';
update public.merchants set opening_balance = -514586.2 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'aed43735-b9b8-4dc0-898e-64c717935bc2'), 0) where id = 'aed43735-b9b8-4dc0-898e-64c717935bc2';
update public.merchants set opening_balance = 2650 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4'), 0) where id = 'c41c33e7-e273-4ca0-bb5f-eaa3d6dad6e4';
update public.merchants set opening_balance = 300 - coalesce((select sum(case when entry_type in ('purchase','credit') then amount else -amount end) from public.merchant_ledger where merchant_id = 'e4c326dd-eab1-4561-9475-e3e7c1520323'), 0) where id = 'e4c326dd-eab1-4561-9475-e3e7c1520323';
update public.clients set opening_balance = 0 - coalesce((select sum(case when entry_type in ('sale','debit') then amount else -amount end) from public.client_ledger where client_id = '76287983-621f-4213-aabf-ae126ffa782c'), 0) where id = '76287983-621f-4213-aabf-ae126ffa782c';
update public.clients set opening_balance = 183000 - coalesce((select sum(case when entry_type in ('sale','debit') then amount else -amount end) from public.client_ledger where client_id = '49b32f88-7a57-44e9-a7c1-a4f1ecd16336'), 0) where id = '49b32f88-7a57-44e9-a7c1-a4f1ecd16336';
update public.clients set opening_balance = 800 - coalesce((select sum(case when entry_type in ('sale','debit') then amount else -amount end) from public.client_ledger where client_id = '52fff8e5-b09d-4112-bd13-570265b8d57f'), 0) where id = '52fff8e5-b09d-4112-bd13-570265b8d57f';
update public.clients set opening_balance = 0 - coalesce((select sum(case when entry_type in ('sale','debit') then amount else -amount end) from public.client_ledger where client_id = '1df1dd5e-789a-42d1-86f8-a4597f5d7b22'), 0) where id = '1df1dd5e-789a-42d1-86f8-a4597f5d7b22';
-- Recompute current balances from opening + ledger (same formula as the triggers)
update public.merchants m set current_balance = coalesce(m.opening_balance,0) + coalesce((select sum(case when l.entry_type in ('purchase','credit') then l.amount else -l.amount end) from public.merchant_ledger l where l.merchant_id = m.id), 0);
update public.clients c set current_balance = coalesce(c.opening_balance,0) + coalesce((select sum(case when l.entry_type in ('sale','debit') then l.amount else -l.amount end) from public.client_ledger l where l.client_id = c.id), 0);

-- ===== Contact messages -> inbox (38) =====
insert into public.reports_inbox (from_name, from_email, from_phone, subject, message, status, created_at) values
  ('RaymondKat', 'no.reply.TobiasLaurent@gmail.com', '83949438781', null, 'Howdy! mtbhouse.store 
 
Did you know that it is possible to send appeals utterly lawful? 
When such business proposals are sent, no personal data is used, and messages are sent to forms specifically designed to receive messages and appeals securely. Contact Form messages are usually not sent to spam, since they are considered to be important. 
Taste our service for free! 
You can count on us for sending up to 50,000 messages. 
 
The cost of sending one million messages is $59. 
 
This offer is automatically generated. 
 
Contact us. 
Telegram - https://t.me/FeedbackFormEU 
WhatsApp - +375259112693 
WhatsApp  https://wa.me/+375259112693 
We only use chat for communication.', 'new', '2026-01-26 03:07:05+00'),
  ('Dyan', 'kraus.dyan@outlook.com', '6732478286', null, 'Improve your website backlinks with trusted seo services! 
BonusBacklinks.com - we deliver daily backlinks and drive organic clicks to your page EVERY DAY:

+ Use 85% OFF
+ Trusted daily backlinks
+ Organic website traffic
+ Price as low as $1
+ Bonus discount codes:

https://BonusBacklinks.com/85offer

BonusBacklinks.com - daily seo backlinks and organic traffic to skyrocket your webpage every day', 'new', '2026-02-02 09:51:31+00'),
  ('AndrewBaing', 'no.reply.HorstWilson@gmail.com', '83647168523', null, 'What’s up? mtbhouse.store 
 
Did you know that it is possible to send appeal absolutely lawfully? 
When such proposals are sent, no personal data is used, and messages are sent to forms specifically designed to receive messages and appeals securely. Messages sent by Feedback Forms are not seen as spam since they are classified as essential. 
Take advantage of our service for free! 
Our service offers up to 50,000 messages for you. 
 
The cost of sending one million messages is $59. 
 
This letter is automatically generated. 
 
Contact us. 
Telegram - https://t.me/FeedbackFormEU 
WhatsApp - +375259112693 
WhatsApp  https://wa.me/+375259112693 
We only use chat for communication.', 'new', '2026-02-20 11:53:09+00'),
  ('Dorie', 'sales@mtbhouse.store', '4106126', null, 'Hello there 

I wanted to reach out and let you know about our new dog harness. It''s really easy to put on and take off - in just 2 seconds - and it''s personalized for each dog. 
Plus, we offer a lifetime warranty so you can be sure your pet is always safe and stylish.

We''ve had a lot of success with it so far and I think your dog would love it. 

Get yours today with 50% OFF: https://caredogbest.com

FREE Shipping - TODAY ONLY! 

Many Thanks, 

Dorie', 'new', '2026-03-06 16:45:44+00'),
  ('Nan', 'sales@veasley.bangeshop.com', '3461862723', null, 'Morning, 

I hope you''re doing well. I wanted to let you know about our new BANGE backpacks and sling bags that just released.

Bange is perfect for students, professionals and travelers. The backpacks and sling bags feature a built-in USB charging port, making it easy to charge your devices on the go.  Also they are waterproof and anti-theft design, making it ideal for carrying your valuables.

Both bags are made of durable and high-quality materials, and are perfect for everyday use or travel.

Order yours now at 50% OFF with FREE Shipping: http://bangeshop.com

Thank You,

Nan', 'new', '2026-03-09 18:41:49+00'),
  ('Jayrn', 'madeleine.kossak@gmail.com', '647601271', null, 'Hi, it’s Jayrn.

Want to find "hidden money" in your business? Dan shares exactly how to exponentially increase your cashflow and the value of your company with these 5 Key Strategies. 

Find out how to find your customer "trigger points" so you know how to market and sell to them. And the best part is... it''s way easier than you think!

Learn More: https://marketersmentor.com/hidden-money.php?refer=mtbhouse.store

Jayrn








Unsubscribe: 
https://marketersmentor.com/unsubscribe.php?d=mtbhouse.store', 'new', '2026-03-12 09:11:03+00'),
  ('Vonnie', 'sales@mtbhouse.store', '353865271', null, 'Hey 

Looking to improve your posture and live a healthier life? Our Medico Postura™ Body Posture Corrector is here to help!

Experience instant posture improvement with Medico Postura™. This easy-to-use device can be worn anywhere, anytime – at home, work, or even while you sleep.

Made from lightweight, breathable fabric, it ensures comfort all day long.

Grab it today at a fantastic 60% OFF: https://medicopostura.com

Plus, enjoy FREE shipping for today only!

Don''t miss out on this amazing deal. Get yours now and start transforming your posture!

Best Wishes, 

Vonnie', 'new', '2026-03-14 16:31:28+00'),
  ('Jayrn', 'holm.ali@gmail.com', '7194888677', null, 'Hi, it’s Jayrn.

Do you want to stop chasing fleeting tactics and finally build a predictable, consistent flood of high-quality customers?

If so, you’re going to love this: https://marketersmentor.com/nobsletter.php?refer=mtbhouse.store

Dan Kennedy, the "Renegade Millionaire Maker" who has guided the empires of marketing legends like Ryan Deiss and Frank Kern, has teamed up with Russell Brunson to open his private vault for the first time. 

Together, they are revealing the exact frameworks that generated 95% of the revenue across millions of analyzed funnels.

If you’ve been suffering from "ADHD Marketing"—hopping from one social media trend to another while your ad budget disappears with no ROI—you need to see this:

https://marketersmentor.com/nobsletter.php?refer=mtbhouse.store

Right now, you can "test-drive" their combined wisdom for 30 days and claim a $19,997 value stack of bonuses—including a massive 653-page physical swipe file of the world''s most profitable funnels—simply by saying "maybe". 

This is the end of the "tactic-hopping" nightmare and the beginning of a business that runs like clockwork.

To multiplying your leverage,
Jayrn



My Blog:
https://www.jayrn.com
Unsubscribe: 
https://marketersmentor.com/unsubscribe.php?d=mtbhouse.store', 'new', '2026-03-16 19:42:27+00'),
  ('Daniel Miller', 'miller1daniel@hotmail.com', '86443393122', null, 'We are interested in buying your business and we wish to discuss with you on the best way forward. 
 
Regards 
Daniel Miller 
 
Email: miller1daniel@hotmail.com', 'new', '2026-03-17 09:32:13+00'),
  ('Colette', 'sales@mtbhouse.store', '675072906', null, 'Hi,

Thought you might like this.

Right now we have a deal on our FitRx™ Wireless Muscle Massager.

https://easerelief.net

It’s rechargeable and app-controlled and works great for post-workout recovery and daily comfort.

The discount won’t last long, so don’t miss the deal.

Best,
Team FitRx™', 'new', '2026-03-18 22:12:14+00'),
  ('Martina', 'sales@mcallister.tidbuy.com', '621117657', null, 'Hello 
 
Is your dog''s nails getting too long? If you''re tired of going to the vet or groomer to get them trimmed, why not try PawSafer™? 
With PawSafer™, you can trim your dog''s nails from the comfort of your own home, and it only takes a few minutes!

PawSafer™ is the safest and most convenient way to trim your dog''s nails, and it''s very affordable. 

Get it while it''s still 50% OFF + FREE Shipping

Buy here: https://tidbuy.com
 
Sincerely, 
 
Martina', 'new', '2026-03-22 00:35:24+00'),
  ('Flossie', 'sales@mtbhouse.store', '648609565', null, 'Good day 

I wanted to reach out and let you know about our new dog harness. It''s really easy to put on and take off - in just 2 seconds - and it''s personalized for each dog. 
Plus, we offer a lifetime warranty so you can be sure your pet is always safe and stylish.

We''ve had a lot of success with it so far and I think your dog would love it. 

Get yours today with 50% OFF: https://caredogbest.com

FREE Shipping - TODAY ONLY! 

To your success, 

Flossie', 'new', '2026-03-24 14:47:39+00'),
  ('Walter', 'sales@calderone.bangeshop.com', '6506767564', null, 'Hello there, 

I hope you''re doing well. I wanted to let you know about our new BANGE backpacks and sling bags that just released.

The bags are waterproof and anti-theft, and have a built-in USB cable that can recharge your phone while you''re on the go.

Both bags are made of durable and high-quality materials, and are perfect for everyday use or travel.

Order yours now at 50% OFF with FREE Shipping: http://bangeshop.com

All the best,

Walter', 'new', '2026-03-30 22:59:51+00'),
  ('Vicky', 'sales@mtbhouse.store', '7052691674', null, 'Hi there 

I wanted to reach out and let you know about our new dog harness. It''s really easy to put on and take off - in just 2 seconds - and it''s personalized for each dog. 
Plus, we offer a lifetime warranty so you can be sure your pet is always safe and stylish.

We''ve had a lot of success with it so far and I think your dog would love it. 

Get yours today with 50% OFF: https://caredogbest.com

FREE Shipping - TODAY ONLY! 

Best Wishes, 

Vicky', 'new', '2026-04-10 02:09:02+00'),
  ('DavidElalp', 'no.reply.KennethGarcia@gmail.com', '86718591516', null, 'Good day! mtbhouse.store, 
I found your website while reviewing websites in this space. 
Our service helps companies reach new partners through website contact pages. 
Businesses globally use contact forms to introduce their services. 
  
We offer a free test so you can evaluate the platform. 
You can get in touch if this seems helpful. 
 
Thank you for your time. 
Contact us. 
Telegram - https://t.me/FeedbackFormEU 
WhatsApp - +375259112693 
WhatsApp  https://wa.me/+375259112693', 'new', '2026-04-10 18:35:14+00'),
  ('Jayrn', 'freame.conrad41@gmail.com', '4162489522', null, 'Hi, it’s Jayrn.

Every market has one rule: He who can spend the most to acquire a customer, wins. But here’s the question nobody answers: How do you actually do it?

In this video, Darcy Juarez walk through the single number that separates the amateurs from the market dominators—Maximum Allowable Cost Per Acquisition. 

Get this wrong, and you’ll bleed cash. Get it right, and you’ll buy customers at scale while your competitors are stuck Googling cheaper ad hacks.

https://marketersmentor.com/crush-your-competition.php?refer=mtbhouse.store


To multiplying your leverage,
Jayrn

P.S.: I’m Jayrn, a digital marketer and e-commerce seller with a passion for sharing knowledge. I share proven strategies, tips, and resources to help you grow your online business.



My Blog:
https://www.jayrn.com
Unsubscribe: 
https://marketersmentor.com/unsubscribe.php?d=mtbhouse.store', 'new', '2026-04-17 02:51:23+00'),
  ('Jayrn', 'wampler.tom@yahoo.com', '3112699520', null, 'Hi, it’s Jayrn.

If you''re tired of leaving your business''s growth up to chance, it''s time to take control of your referrals. 

In this video, join Darcy Juarez and marketing legend Dan Kennedy as they dive deep into the art and science of creating a magnetic referral system that will revolutionize your business.

Dan Kennedy emphasizes the critical importance of maximizing referrals, pointing out that without a solid referral strategy, you''re wasting the majority of your marketing budget. 

Most businesses underperform in obtaining referrals, largely due to a lack of strategy and tracking.

Watch it here: https://marketersmentor.com/referral-system.php?refer=mtbhouse.store


To multiplying your leverage,
Jayrn

P.S.: I’m Jayrn, a digital marketer and e-commerce seller with a passion for sharing knowledge. I share proven strategies, tips, and resources to help you grow your online business.



My Blog:
https://www.jayrn.com
Unsubscribe: 
https://marketersmentor.com/unsubscribe.php?d=mtbhouse.store', 'new', '2026-04-20 15:39:00+00'),
  ('Jayrn', 'darcy.grissom@gmail.com', null, null, 'Hey,it’s Jayrn.

There’s a pattern I keep seeing…

People who *work hard*, try different strategies, even invest in tools…

…but still don’t see consistent results.

It’s not because they’re lazy.
It’s not because they’re unlucky.

It’s because they’re following **disconnected advice**.

One strategy here.
Another tactic there.

No real understanding of what actually drives revenue.

And when you don’t understand the “why”…

You’re stuck guessing.

---

That’s exactly where I was.

Until I started studying something different:

Not surface-level tactics…

…but the **actual thinking behind successful marketing campaigns**.

That’s when things finally started to click.

---

If you want to see what I mean, take a look at this:

������ https://marketersmentor.com/NO-BS-Letter.php?refer=mtbhouse.store

Even just reading the page will shift how you think about marketing.

More tomorrow.

—
Jayrn

P.S.: I’m Jayrn, a digital marketer and e-commerce seller with a passion for sharing knowledge. I share proven strategies, tips, and resources to help you grow your online business.



My Blog:
https://www.jayrn.com
Unsubscribe: 
https://marketersmentor.com/unsubscribe.php?d=mtbhouse.store', 'new', '2026-04-22 19:59:16+00'),
  ('Samuel', 'sales@mtbhouse.store', '9266299667', null, 'Morning 

Looking to improve your posture and live a healthier life? Our Medico Postura™ Body Posture Corrector is here to help!

Experience instant posture improvement with Medico Postura™. This easy-to-use device can be worn anywhere, anytime – at home, work, or even while you sleep.

Made from lightweight, breathable fabric, it ensures comfort all day long.

Grab it today at a fantastic 60% OFF: https://medicopostura.com

Plus, enjoy FREE shipping for today only!

Don''t miss out on this amazing deal. Get yours now and start transforming your posture!

Thanks for your time, 

Samuel', 'new', '2026-04-27 23:14:32+00'),
  ('Newton Poole', 'melaniefell51@gmail.com', '89937674486', null, 'Hello!! 
My name is Newton Poole, I work as the Research and Procurement Pharmacist in a pharmaceutical company. I am writing to extend a business request to you.  I am looking for a trustworthy entrepreneur/individual to represent my company in sourcing some of Herbal oil basic raw materials used in the manufacturing of high-quality antiviral vaccines, cancer treatment, and other life-saving treatments. I am assuring you that good profits will be earned from the commission that will be paid to middle-person(s). 
I will provide exclusive details to you upon your acceptance. 
Contact WhatsApp: +1 602-487-5666 
contact by email only when you don''t have WhatsApp: labchiefnewton@chemist.com 
I await your response to provide further details to you. 
Regards 
Newton Poole.', 'new', '2026-04-28 12:12:04+00'),
  ('Ulysses', 'sales@cupp.tidbuy.com', '629451535', null, 'Hey there 
 
Is your dog''s nails getting too long? If you''re tired of going to the vet or groomer to get them trimmed, why not try PawSafer™? 
With PawSafer™, you can trim your dog''s nails from the comfort of your own home, and it only takes a few minutes!

PawSafer™ is the safest and most convenient way to trim your dog''s nails, and it''s very affordable. 

Get it while it''s still 50% OFF + FREE Shipping

Buy here: https://tidbuy.com
 
Cheers, 
 
Ulysses', 'new', '2026-05-04 12:58:23+00'),
  ('Otis', 'sales@mtbhouse.store', '2687789031', null, 'Hello 

I wanted to reach out and let you know about our new dog harness. It''s really easy to put on and take off - in just 2 seconds - and it''s personalized for each dog. 
Plus, we offer a lifetime warranty so you can be sure your pet is always safe and stylish.

We''ve had a lot of success with it so far and I think your dog would love it. 

Get yours today with 50% OFF: https://caredogbest.com

FREE Shipping - TODAY ONLY! 

To your success, 

Otis', 'new', '2026-05-13 21:25:49+00'),
  ('Edward Dublin', 'newenergybrokers@gmail.com', '86716984645', null, 'Good afternoon, 
 
I am reaching out to discuss an investment initiative currently under consideration which will certainly benefit you/your business. 
 
Please not that it  will NOT require any financial input from you whatsoever except the partnership/collaboration of your business to facilitate its deployment. 
 
My profile is available through http://www.edwarddublin.com/ . I''m a UK resident and former Ukraine based businessman. 
 
I would welcome a brief reply so we can arrange a short introductory discussion. 
. 
With best regards, 
Mr. Edward Dublin 
Email; edward@edwarddublin.com', 'new', '2026-05-19 12:17:34+00'),
  ('Ken', 'kenp2025x@yahoo.com', '40194515', null, 'Was just browsing mtbhouse.store and was impressed the layout. Nicely design and great user experience. Just had to drop a message, have a great day! we7f8sd82', 'new', '2026-05-20 13:07:27+00'),
  ('Bryce', 'sales@mtbhouse.store', '7828815945', null, 'Hello there 

Looking to improve your posture and live a healthier life? Our Medico Postura™ Body Posture Corrector is here to help!

Experience instant posture improvement with Medico Postura™. This easy-to-use device can be worn anywhere, anytime – at home, work, or even while you sleep.

Made from lightweight, breathable fabric, it ensures comfort all day long.

Grab it today at a fantastic 60% OFF: https://medicopostura.com

Plus, enjoy FREE shipping for today only!

Don''t miss out on this amazing deal. Get yours now and start transforming your posture!

Enjoy, 

Bryce', 'new', '2026-05-26 22:40:21+00'),
  ('Ronaldven', 'jacksrenome@gmx.com', '81153691644', null, 'YyErjcwdkdjwjjwjjdwjddjwsjf ndsaKAqwdweihduncbbwebidaa iudwnishqwuvdwqihbfvweuiojsqjqioqdefiw dwqsqwijbfiewdncbhvdifqhioqsjnqw mtbhouse.store', 'new', '2026-06-07 01:43:23+00'),
  ('Russellthirl', 'slongo26@yahoo.com', '88525865752', null, 'URGENT MESSAGE! You''ve Peered 1.3426 BTC Now Transfer Result https://qrlinkgenerator.com/WiiTO', 'new', '2026-06-08 17:07:17+00'),
  ('Russellthirl', 'samanthamueller055@gmail.com', '87979376661', null, 'URGENT MESSAGE! YOUR 1.3426 BTC IS CLEARED FOR TAKEOFF https://meumini.link/awdSRK', 'new', '2026-06-11 10:11:21+00'),
  ('Russellthirl', 'suesnyder881@gmail.com', '86688351648', null, 'THE $27,000,000 JACKPOT IS A JOURNEY TO JOY https://link.1hut.ru/uSSOUj', 'new', '2026-06-11 20:44:25+00'),
  ('Russellthirl', 'ritikagarwal198@gmail.com', '88487554534', null, 'THE $27,000,000 JACKPOT IS A MEDAL FOR MOMENTUM https://m.clickto.cc/aWbkx', 'new', '2026-06-14 22:55:41+00'),
  ('Russellthirl', 'jvilla012@gmail.com', '82878597796', null, 'YOUR BIG BREAK IS HERE: PURSUE THE $27,000,000 JACKPOT https://alstr.in/fzmNgR', 'new', '2026-06-17 11:56:05+00'),
  ('Russellthirl', 'maminugarba@gmail.com', '87581917426', null, 'Step Into the Winner’s Circle With the $27,000,000 Jackpot https://myip.kr/gVhZV', 'new', '2026-06-19 15:37:51+00'),
  ('Russellthirl', 'rebeccaredondo21@outlook.comr', '86663899211', null, 'THE $27,000,000 JACKPOT IS A TOAST TO TOMORROW https://1.g9.yt/456k', 'new', '2026-06-22 01:16:26+00'),
  ('Russellthirl', 'johnnymallorca@mail.com', '89267897319', null, 'WHY THE $27,000,000 JACKPOT IS THE PERFECT TARGET FOR TODAY http://freeurlredirect.com/d6p21', 'new', '2026-06-24 21:54:58+00'),
  ('Claudette', 'sales@mtbhouse.store', '656022210', null, 'Hello 

I wanted to reach out and let you know about our new dog harness. It''s really easy to put on and take off - in just 2 seconds - and it''s personalized for each dog. 
Plus, we offer a lifetime warranty so you can be sure your pet is always safe and stylish.

We''ve had a lot of success with it so far and I think your dog would love it. 

Get yours today with 50% OFF: https://caredogbest.com

FREE Shipping - TODAY ONLY! 

Have a great time, 

Claudette', 'new', '2026-06-27 16:13:16+00'),
  ('Russellthirl', 'masseyd87@yahoo.com', '83977497899', null, 'URGENT! Don''t Second Guess Withdraw 1.3426 BTC http://freeurlredirect.com/d3jw2', 'new', '2026-06-28 19:30:04+00'),
  ('Russellthirl', 'tstonham28@gmail.com', '84545181214', null, 'THE $27,000,000 JACKPOT IS A STAMP OF SUCCESS https://nordwit.com/MopgNg', 'new', '2026-06-30 12:36:04+00'),
  ('Russellthirl', 'jayandaurelia@gmail.com', '82648213399', null, 'THE $27,000,000 JACKPOT IS A SUPERNOVA OF SMILES https://alstr.in/qBHiAXw', 'new', '2026-07-03 18:24:44+00');

commit;
-- Verification: row counts after import
select 'merchants' t, count(*) from public.merchants union all select 'clients', count(*) from public.clients union all select 'products', count(*) from public.products union all select 'stock_purchases', count(*) from public.stock_purchases union all select 'merchant_ledger', count(*) from public.merchant_ledger union all select 'invoices', count(*) from public.invoices union all select 'reports_inbox', count(*) from public.reports_inbox;