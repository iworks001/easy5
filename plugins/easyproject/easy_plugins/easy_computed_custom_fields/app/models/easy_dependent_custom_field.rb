class EasyDependentCustomField < ActiveRecord::Base
  belongs_to :custom_field
  belongs_to :dependency, :polymorphic => true

  validates_uniqueness_of :custom_field_id, :scope => [:dependency_id, :dependency_type, :relation]

  PARENT_RELATION = :parent

  RELATIONS = {
    PARENT_RELATION => 1
  }

  def dependent_values( dependency )
    if self.relation == PARENT_RELATION
      dependency.send(:update_nested_set_attributes) if dependency.is_a?(Issue)
      ancestors_scope = dependency.ancestors.select(:id)
      values = CustomValue.preload(:custom_field).where( :customized_type => dependency.class.name, :customized_id => ancestors_scope, :custom_field_id => custom_field.id ).to_a
      values_ancestors = values.collect(&:customized_id)
      ancestors_scope.each do |ancestor_id|
        values << CustomValue.new( :customized_type => dependency.class.name, :customized_id => ancestor_id.id, :custom_field_id => custom_field.id ) unless values_ancestors.include?(ancestor_id.id)
      end

      values
    else
      self.custom_field.dependent_values( dependency )
    end
  end

  def relation=( relation )
    relation = RELATIONS[relation] unless relation.is_a?(Integer)
    write_attribute(:relation, relation)
  end

  def relation
    rel = read_attribute(:relation)
    RELATIONS.invert[rel]
  end

end

