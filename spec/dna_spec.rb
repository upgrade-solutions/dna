# frozen_string_literal: true
require_relative 'spec_helper'

RSpec.describe DNA do
  it "has a version number" do
    expect(DNA::VERSION).not_to be nil
  end
end