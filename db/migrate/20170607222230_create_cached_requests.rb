class CreateCachedRequests < ActiveRecord::Migration[5.0]
  def change
    create_table :cached_requests do |t|
      t.string :query_key
      t.text :response_text
      t.timestamps
    end
    add_index :cached_requests, [:query_key], :unique => true
  end
end
