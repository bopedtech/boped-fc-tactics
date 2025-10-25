-- Change programs.id from bigint to text to support string IDs like 'PROGRAM_TOTS25'
ALTER TABLE programs DROP CONSTRAINT programs_pkey;
ALTER TABLE programs ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE programs ADD PRIMARY KEY (id);