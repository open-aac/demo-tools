class CreateUserStates < ActiveRecord::Migration[5.0]
  def change
    create_table :user_states do |t|
      t.string :user_code
      t.text :state
      t.timestamps
    end
    add_index :user_states, [:user_code]
  end
end
