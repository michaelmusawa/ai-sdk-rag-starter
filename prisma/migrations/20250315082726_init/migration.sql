BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[embeddings] (
    [id] NVARCHAR(1000) NOT NULL,
    [resource_id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(4000) NOT NULL,
    [embedding] VARBINARY(6144) NOT NULL,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [embeddings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [embeddings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [embeddings_embedding_idx] ON [dbo].[embeddings]([embedding]);

-- AddForeignKey
ALTER TABLE [dbo].[embeddings] ADD CONSTRAINT [embeddings_resource_id_fkey] FOREIGN KEY ([resource_id]) REFERENCES [dbo].[resources]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
