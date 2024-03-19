create table "public"."unsubscribed" (
    "created_at" timestamp with time zone not null default now(),
    "slack_id" text not null
);


alter table "public"."unsubscribed" enable row level security;

CREATE UNIQUE INDEX unsubscribed_pkey ON public.unsubscribed USING btree (slack_id);

CREATE UNIQUE INDEX unsubscribed_slack_id_key ON public.unsubscribed USING btree (slack_id);

alter table "public"."unsubscribed" add constraint "unsubscribed_pkey" PRIMARY KEY using index "unsubscribed_pkey";

alter table "public"."unsubscribed" add constraint "unsubscribed_slack_id_key" UNIQUE using index "unsubscribed_slack_id_key";

grant delete on table "public"."unsubscribed" to "anon";

grant insert on table "public"."unsubscribed" to "anon";

grant references on table "public"."unsubscribed" to "anon";

grant select on table "public"."unsubscribed" to "anon";

grant trigger on table "public"."unsubscribed" to "anon";

grant truncate on table "public"."unsubscribed" to "anon";

grant update on table "public"."unsubscribed" to "anon";

grant delete on table "public"."unsubscribed" to "authenticated";

grant insert on table "public"."unsubscribed" to "authenticated";

grant references on table "public"."unsubscribed" to "authenticated";

grant select on table "public"."unsubscribed" to "authenticated";

grant trigger on table "public"."unsubscribed" to "authenticated";

grant truncate on table "public"."unsubscribed" to "authenticated";

grant update on table "public"."unsubscribed" to "authenticated";

grant delete on table "public"."unsubscribed" to "service_role";

grant insert on table "public"."unsubscribed" to "service_role";

grant references on table "public"."unsubscribed" to "service_role";

grant select on table "public"."unsubscribed" to "service_role";

grant trigger on table "public"."unsubscribed" to "service_role";

grant truncate on table "public"."unsubscribed" to "service_role";

grant update on table "public"."unsubscribed" to "service_role";


