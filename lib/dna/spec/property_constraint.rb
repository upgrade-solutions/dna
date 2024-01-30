module DNA::Spec::PropertyConstraint
  def assign_string_constraints(args)
    [:string_min_length, :string_max_length, :string_pattern].each do |constraint|
      self.class.send(:attr_accessor, constraint)
    end
    @string_min_length = args.fetch(:string_min_length, nil)
    @string_max_length = args.fetch(:string_max_length, nil)
    @string_pattern = args.fetch(:string_pattern, nil)
  end

  def assign_boolean_constraints(args)
    self.class.send(:attr_accessor, :boolean_equals)
    @boolean_equals = args.fetch(:boolean_equals, nil)
  end
end