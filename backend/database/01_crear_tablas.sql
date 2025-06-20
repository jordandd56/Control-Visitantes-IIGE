/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/* Created on:     19/6/2025 19:52:08                           */
/*==============================================================*/




/*==============================================================*/
/* Table: areas                                                 */
/*==============================================================*/
create table areas (
   id                   SERIAL not null,
   nombre               VARCHAR(100)         not null,
   constraint PK_AREAS primary key (id),
   constraint AK_KEY_2_AREAS unique (nombre)
);

/*==============================================================*/
/* Table: roles                                                 */
/*==============================================================*/
create table roles (
   id                   SERIAL not null,
   nombre               VARCHAR(50)          not null,
   constraint PK_ROLES primary key (id),
   constraint AK_KEY_2_ROLES unique (nombre)
);

/*==============================================================*/
/* Table: usuarios                                              */
/*==============================================================*/
create table usuarios (
   id                   SERIAL not null,
   nombre_completo      VARCHAR(100)         not null,
   usuario              VARCHAR(50)          not null,
   contrasena           VARCHAR(255)         not null,
   rol_id               INTEGER              not null,
   constraint PK_USUARIOS primary key (id),
   constraint AK_KEY_2_USUARIOS unique (usuario)
);

/*==============================================================*/
/* Table: visitantes                                            */
/*==============================================================*/
create table visitantes (
   id                   SERIAL not null,
   cedula               VARCHAR(20)          not null,
   pasaporte            VARCHAR(20)          not null,
   nombres              VARCHAR(100)         not null,
   constraint PK_VISITANTES primary key (id),
   constraint AK_KEY_2_VISITANT unique (cedula)
);

/*==============================================================*/
/* Table: visitas                                               */
/*==============================================================*/
create table visitas (
   id                   SERIAL not null,
   visitante_id         INTEGER              not null,
   a_quien_visita       VARCHAR(100)         not null,
   area_id              INTEGER              not null,
   motivo               TEXT                 not null,
   fecha                DATE                 not null default CURRENT_DATE,
   hora_ingreso         TIME                 not null,
   hora_salida          TIME                 null,
   registrado_por       INTEGER              not null,
   observacion          TEXT                 not null,
   constraint PK_VISITAS primary key (id)
);

alter table usuarios
   add constraint fk_usuarios_roles foreign key (rol_id)
      references roles (id)
      on delete restrict on update restrict;

alter table visitas
   add constraint fk_visitas_area foreign key (area_id)
      references areas (id)
      on delete restrict on update restrict;

alter table visitas
   add constraint fk_visitas_usuario foreign key (registrado_por)
      references usuarios (id)
      on delete restrict on update restrict;

alter table visitas
   add constraint fk_visitas_visitante foreign key (visitante_id)
      references visitantes (id)
      on delete restrict on update restrict;

