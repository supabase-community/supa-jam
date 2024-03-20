create table
  public.members (
    id text not null,
    team_id text null,
    name text null,
    real_name text null,
    email text null,
    constraint members_pkey primary key (id)
  ) tablespace pg_default;