-- rows that exist before the proposal is applied
insert into jobs (source, external_id, title, country, apply_url, posted_at, is_active)
values ('adzuna','legacy-on','Teacher','GB','https://example.test/a', now(), true),
       ('adzuna','legacy-off','Teacher','GB','https://example.test/b', now(), false);
